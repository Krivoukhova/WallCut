import { useCallback, useEffect, useMemo, useState } from 'react';

import { DEFAULT_BACKGROUND, type BackgroundStyle } from '../../domain/background/backgroundTypes';
import type { ShortsProject } from '../../domain/project/projectTypes';
import type { VisualTimelineData } from '../../domain/timeline/visualTimelineTypes';
import type { ProjectService, LocalAudioTrack } from '../../application/project/projectService';
import { buildProjectSnapshot as createProjectSnapshot } from '../../application/project/buildProjectSnapshot';
import { buildAudioAssetPatch as createAudioAssetPatch } from '../../application/project/buildAudioAssetPatch';
import { updateProjectDocument } from '../../application/project/updateProjectDocument';
import { hasProjectChanges as detectProjectChanges } from '../../application/project/hasProjectChanges';
import { canClearAudioAssetDirtyFlag } from '../../application/project/audioAssetRevision';
import { useProjectAutosaveController } from './useProjectAutosaveController';
import { fingerprintAudioTracks, type EditorAudioTrack } from '../timeline/audioTrackOperations';

export type ProjectPersistenceInput = {
  projectService: ProjectService;
  projectId?: string;
  projectName?: string;
  projectDocument?: ShortsProject;
  editorDirty: boolean;
  editorTimeline: VisualTimelineData;
  projectBackground?: BackgroundStyle;
  audioTracks: EditorAudioTrack[];
  initialAudioTracks?: LocalAudioTrack[];
  audioAssetDirtyRef: { current: boolean };
  audioRevisionRef: { current: number };
  onSave: () => void;
  onClearError: () => void;
  onError: (error: unknown) => void;
};

/** Coordinates project snapshots, audio asset patches, manual saves, and autosaves. */
export function useProjectPersistence(input: ProjectPersistenceInput) {
  const {
    projectService,
    projectId,
    projectName,
    projectDocument,
    editorDirty,
    editorTimeline,
    projectBackground,
    audioTracks,
    initialAudioTracks,
    audioAssetDirtyRef,
    audioRevisionRef,
    onSave,
    onClearError,
    onError,
  } = input;

  const [isSaving, setIsSaving] = useState(false);
  const [savedAudioFingerprint, setSavedAudioFingerprint] = useState(() =>
    fingerprintAudioTracks((initialAudioTracks ?? []).map((track) => ({ ...track, publicPath: '' }))),
  );
  const [savedProjectName, setSavedProjectName] = useState(
    projectName ?? projectDocument?.metadata?.name ?? '',
  );
  const [savedBackgroundFingerprint, setSavedBackgroundFingerprint] = useState(() =>
    JSON.stringify(projectDocument?.background ?? null),
  );
  const audioFingerprint = useMemo(() => fingerprintAudioTracks(audioTracks), [audioTracks]);
  const backgroundFingerprint = useMemo(
    () => JSON.stringify(projectBackground ?? null),
    [projectBackground],
  );

  const buildProjectSnapshot = useCallback(
    (): ShortsProject =>
      createProjectSnapshot({
        base: projectDocument,
        visualTimeline: editorTimeline,
        background: projectBackground ?? DEFAULT_BACKGROUND,
        audioTracks,
        projectName,
      }),
    [audioTracks, editorTimeline, projectBackground, projectDocument, projectName],
  );

  const { autosaveController, autosaveStatus } = useProjectAutosaveController((error) => {
    console.error('WallCut local autosave failed:', error);
    onError(error);
  });

  const buildAudioAssetPatch = useCallback(
    () => createAudioAssetPatch(audioTracks, audioAssetDirtyRef.current),
    [audioAssetDirtyRef, audioTracks],
  );

  const markPersisted = useCallback(
    (savedAudioRevision: number) => {
      setSavedAudioFingerprint(audioFingerprint);
      setSavedProjectName(projectName ?? projectDocument?.metadata?.name ?? '');
      setSavedBackgroundFingerprint(backgroundFingerprint);
      if (canClearAudioAssetDirtyFlag(audioRevisionRef.current, savedAudioRevision)) {
        audioAssetDirtyRef.current = false;
      }
      onSave();
    },
    [
      audioAssetDirtyRef,
      audioFingerprint,
      audioRevisionRef,
      backgroundFingerprint,
      onSave,
      projectDocument,
      projectName,
    ],
  );

  const handleSaveProject = useCallback(async () => {
    if (isSaving) return;
    onClearError();
    setIsSaving(true);
    try {
      await autosaveController.flush();
      if (!projectId) throw new Error('PROJECT_ID_REQUIRED');
      const project = buildProjectSnapshot();
      const savedAudioRevision = audioRevisionRef.current;
      await updateProjectDocument({
        projectService,
        projectId,
        projectName,
        project,
        audioAssets: buildAudioAssetPatch(),
        failureCode: 'PROJECT_SAVE_FAILED',
      });
      await markPersisted(savedAudioRevision);
    } catch (error) {
      console.error('WallCut project save failed:', error);
      onError(error);
    } finally {
      setIsSaving(false);
    }
  }, [
    audioRevisionRef,
    autosaveController,
    buildAudioAssetPatch,
    buildProjectSnapshot,
    isSaving,
    markPersisted,
    onClearError,
    onError,
    projectId,
    projectName,
    projectService,
  ]);

  const hasProjectChanges = detectProjectChanges({
    editorDirty,
    audioFingerprint,
    savedAudioFingerprint,
    audioAssetsDirty: audioAssetDirtyRef.current,
    projectName: projectName ?? projectDocument?.metadata?.name ?? '',
    savedProjectName,
    backgroundFingerprint,
    savedBackgroundFingerprint,
  });

  useEffect(() => {
    if (!projectId || !projectDocument || !hasProjectChanges) return;
    const scheduledAudioRevision = audioRevisionRef.current;
    autosaveController.schedule(async () => {
      const project = buildProjectSnapshot();
      await updateProjectDocument({
        projectService,
        projectId,
        projectName,
        project,
        audioAssets: buildAudioAssetPatch(),
        failureCode: 'PROJECT_AUTOSAVE_FAILED',
      });
      markPersisted(scheduledAudioRevision);
    });
  }, [
    audioAssetDirtyRef,
    audioFingerprint,
    audioRevisionRef,
    autosaveController,
    backgroundFingerprint,
    buildAudioAssetPatch,
    buildProjectSnapshot,
    editorDirty,
    hasProjectChanges,
    markPersisted,
    projectDocument,
    projectId,
    projectName,
    projectService,
    savedAudioFingerprint,
    savedBackgroundFingerprint,
    savedProjectName,
  ]);

  return {
    autosaveController,
    autosaveStatus,
    buildProjectSnapshot,
    hasProjectChanges,
    handleSaveProject,
    isSaving,
  };
}
