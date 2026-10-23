import React, { useCallback, useEffect, useRef, useState } from 'react';

import { type PlayerRef } from '@remotion/player';

import { EditorHeader } from './components/EditorHeader';

import { EditorWorkspace } from './components/EditorWorkspace';

import { EditorTimeline } from './EditorTimeline';

import { useEditor } from './hooks/useEditor';

import type { TTSTimeline } from '../domain/timeline/ttsTimelineTypes';

import type { VisualTimelineData } from '../domain/timeline/visualTimelineTypes';

import type { ShortsProject } from '../domain/project/projectTypes';
import type { BackgroundStyle } from '../domain/background/backgroundTypes';
import type { ApplicationRuntime } from '../application/runtime/runtimeServices';

import type { LanguageCode } from '../domain/i18n/types';

import type { AudioTrackState } from './timeline/audioTrackTypes';
import { splitAudioTrack, type EditorAudioTrack } from './timeline/audioTrackOperations';
import { createDefaultAudioTrackState } from './timeline/audioTrackTypes';
import type { ProjectService, LocalAudioTrack } from '../application/project/projectService';
import { useEditorExport } from './hooks/useEditorExport';
import { useProjectPersistence } from './hooks/useProjectPersistence';

import { I18nProvider, useI18n } from './i18n/I18nContext';
import { useEditorTheme } from './hooks/useEditorTheme';
import { EditorContextMenu } from './components/EditorContextMenu';

type EditorProps = {
  projectService: ProjectService;
  runtime: ApplicationRuntime;
  timeline: TTSTimeline;
  visualTimeline: VisualTimelineData;
  projectDocument?: ShortsProject;

  uiLanguage?: LanguageCode;
  projectId?: string;
  projectName?: string;
  projectAudioTracks?: LocalAudioTrack[];
};

export const Editor: React.FC<EditorProps> = ({
  timeline,
  visualTimeline,
  projectDocument,
  uiLanguage,
  projectId,
  projectName,
  projectAudioTracks,
  projectService,
  runtime,
}) => {
  return (
    <I18nProvider language={uiLanguage}>
      <EditorContent
        timeline={timeline}
        visualTimeline={visualTimeline}
        projectDocument={projectDocument}
        projectId={projectId}
        projectName={projectName}
        projectAudioTracks={projectAudioTracks}
        projectService={projectService}
        runtime={runtime}
      />
    </I18nProvider>
  );
};

type EditorContentProps = {
  projectService: ProjectService;
  runtime: ApplicationRuntime;
  timeline: TTSTimeline;
  visualTimeline: VisualTimelineData;
  projectDocument?: ShortsProject;
  projectId?: string;
  projectName?: string;
  projectAudioTracks?: LocalAudioTrack[];
};

const EditorContent: React.FC<EditorContentProps> = ({
  timeline,
  visualTimeline,
  projectDocument,
  projectId,
  projectName,
  projectAudioTracks,
  projectService,
  runtime,
}) => {
  const { translations: t, language } = useI18n();
  const [theme, setTheme] = useEditorTheme(language);

  const audioUndoStackRef = useRef<EditorAudioTrack[][]>([]);
  const audioRedoStackRef = useRef<EditorAudioTrack[][]>([]);
  const audioHistoryActionRef = useRef<'undo' | 'redo' | null>(null);
  const audioTracksRef = useRef<EditorAudioTrack[]>([]);

  const undoAudio = useCallback(() => {
    const previous = audioUndoStackRef.current.pop();
    if (!previous) return false;
    audioRedoStackRef.current.push(audioTracksRef.current);
    audioTracksRef.current = previous;
    setAudioTracks(previous);
    audioHistoryActionRef.current = 'undo';
    return true;
  }, []);

  const redoAudio = useCallback(() => {
    const next = audioRedoStackRef.current.pop();
    if (!next) return false;
    audioUndoStackRef.current.push(audioTracksRef.current);
    audioTracksRef.current = next;
    setAudioTracks(next);
    audioHistoryActionRef.current = 'redo';
    return true;
  }, []);

  const editor = useEditor({
    timeline,
    visualTimeline,
    runtime,
    externalUndo: () => undoAudio(),
    externalRedo: () => redoAudio(),
  });

  const { editorTimeline, handleSave, setCurrentFrame } = editor;

  const playerRef = useRef<PlayerRef | null>(null);

  const [audioTracks, setAudioTracks] = useState<EditorAudioTrack[]>(() =>
    (projectAudioTracks ?? []).map((track) => ({ ...track, publicPath: '' })),
  );

  useEffect(() => {
    audioTracksRef.current = audioTracks;
  }, [audioTracks]);

  useEffect(() => {
    const nextUrls = new Map<string, string>();
    for (const track of audioTracks) {
      if (track.binary)
        nextUrls.set(
          track.id,
          URL.createObjectURL(
            new Blob([track.binary], { type: track.mimeType ?? 'application/octet-stream' }),
          ),
        );
    }
    setAudioTracks((current) =>
      current.map((track) => ({ ...track, publicPath: nextUrls.get(track.id) ?? '' })),
    );
    return () => {
      for (const url of nextUrls.values()) URL.revokeObjectURL(url);
    };
    // Object URLs are recreated only when the track collection/blob set changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectAudioTracks]);

  const [audioSelectedId, setAudioSelectedId] = useState<string | null>(null);
  const audioAssetDirtyRef = useRef(false);
  const audioRevisionRef = useRef(0);
  const [projectBackground, setProjectBackground] = useState<BackgroundStyle | undefined>(
    projectDocument?.background,
  );
  const [saveError, setSaveError] = useState<string | null>(null);

  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    type: 'editor' | 'audio';
    trackId?: string;
  } | null>(null);

  const updateAudioTrack = useCallback((trackId: string, patch: Partial<AudioTrackState>) => {
    setAudioTracks((current) =>
      current.map((track) =>
        track.id === trackId ? { ...track, state: { ...track.state, ...patch } } : track,
      ),
    );
    // Audio state changes are persisted as metadata; the binary asset is unchanged.
  }, []);

  const handleAudioAdd = useCallback(
    (file: File) => {
      if (!file.type.startsWith('audio/') && !/\.(wav|mp3|m4a|aac|ogg|webm)$/i.test(file.name)) {
        alert(t.audio.invalidFile);
        return;
      }

      const id = crypto.randomUUID();
      const publicPath = URL.createObjectURL(file);
      const audio = new Audio(publicPath);
      let handled = false;

      const finish = async (durationSeconds: number) => {
        if (handled) return;
        handled = true;
        audio.removeEventListener('loadedmetadata', handleMetadata);
        audio.removeEventListener('error', handleError);
        URL.revokeObjectURL(publicPath);

        const durationFrames = Math.max(1, Math.round(durationSeconds * editor.timeline.fps));
        const playbackUrl = URL.createObjectURL(file);

        const binary = await file.arrayBuffer();

        setAudioTracks((current) => [
          ...current,
          {
            id,
            binary,
            publicPath: playbackUrl,
            fileName: file.name,
            mimeType: file.type,
            state: createDefaultAudioTrackState(durationFrames),
          },
        ]);
        audioAssetDirtyRef.current = true;
        audioRevisionRef.current += 1;
        setAudioSelectedId(id);
        setContextMenu(null);
      };

      const handleMetadata = () => {
        if (Number.isFinite(audio.duration) && audio.duration > 0) {
          finish(audio.duration);
        } else {
          finish(editor.timeline.totalFrames / editor.timeline.fps);
        }
      };

      const handleError = () => {
        if (handled) return;
        handled = true;
        audio.removeEventListener('loadedmetadata', handleMetadata);
        audio.removeEventListener('error', handleError);
        URL.revokeObjectURL(publicPath);
        setSaveError('AUDIO_METADATA_DECODE_FAILED');
      };

      audio.addEventListener('loadedmetadata', handleMetadata, { once: true });
      audio.addEventListener('error', handleError, { once: true });
      audio.load();
    },
    [editor.timeline.fps, editor.timeline.totalFrames, t.audio.invalidFile],
  );

  const handleSplitAudioTrack = useCallback((trackId: string, splitFrame: number) => {
    setAudioTracks((current) => {
      const result = splitAudioTrack(current, trackId, splitFrame, crypto.randomUUID());
      if (!result.didSplit || !result.secondTrackId) return current;

      audioUndoStackRef.current.push(current);
      audioRedoStackRef.current.length = 0;
      audioHistoryActionRef.current = null;
      audioAssetDirtyRef.current = true;
      audioRevisionRef.current += 1;
      setAudioSelectedId(result.secondTrackId);
      setContextMenu(null);
      return result.tracks;
    });
  }, []);

  const deleteAudioTrack = useCallback(
    (trackId: string) => {
      const track = audioTracks.find((item) => item.id === trackId);
      // Splitting a track intentionally shares its playback URL. Revoke it only
      // when no other live segment still references that URL.
      if (
        track?.publicPath &&
        !audioTracks.some((item) => item.id !== trackId && item.publicPath === track.publicPath)
      ) {
        URL.revokeObjectURL(track.publicPath);
      }
      setAudioTracks((current) => current.filter((item) => item.id !== trackId));
      audioAssetDirtyRef.current = true;
      audioRevisionRef.current += 1;
      setAudioSelectedId((current) => (current === trackId ? null : current));
      setContextMenu(null);
    },
    [audioTracks],
  );

  useEffect(() => {
    const handleAudioDeleteKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const isEditable =
        target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;
      if (isEditable || !audioSelectedId) return;
      if (event.key !== 'Delete') return;
      event.preventDefault();
      event.stopPropagation();
      deleteAudioTrack(audioSelectedId);
    };
    window.addEventListener('keydown', handleAudioDeleteKey, true);
    return () => window.removeEventListener('keydown', handleAudioDeleteKey, true);
  }, [audioSelectedId, deleteAudioTrack]);

  const handlePlayerRef = useCallback((ref: PlayerRef | null) => {
    playerRef.current = ref;
  }, []);

  const handleEditorContextMenu = useCallback(
    (event: React.MouseEvent<HTMLDivElement>) => {
      event.preventDefault();

      const target = event.target as HTMLElement;
      const blockElement = target.closest(
        '[data-editor-overlay-block], [data-editor-block]',
      ) as HTMLElement | null;
      const editorId = blockElement?.dataset.editorId;

      if (editorId) {
        editor.selectBlock(editorId);
      }

      setAudioSelectedId(null);
      setContextMenu({
        x: Math.min(event.clientX, window.innerWidth - 230),
        y: Math.min(event.clientY, window.innerHeight - 360),
        type: 'editor',
      });
    },
    [editor],
  );

  const handleAudioContextMenu = useCallback(
    (trackId: string, event: React.MouseEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      setAudioSelectedId(trackId);
      editor.clearSceneSelection();
      setContextMenu({
        x: Math.min(event.clientX, window.innerWidth - 230),
        y: Math.min(event.clientY, window.innerHeight - 220),
        type: 'audio',
        trackId,
      });
    },
    [editor],
  );

  const closeContextMenu = useCallback(() => {
    setContextMenu(null);
  }, []);

  const runContextAction = useCallback((action: () => void) => {
    action();
    setContextMenu(null);
  }, []);

  const {
    autosaveController,
    autosaveStatus,
    buildProjectSnapshot,
    hasProjectChanges,
    handleSaveProject,
    isSaving,
  } = useProjectPersistence({
    projectService,
    projectId,
    projectName,
    projectDocument,
    editorDirty: editor.isDirty,
    editorTimeline,
    projectBackground,
    audioTracks,
    initialAudioTracks: projectAudioTracks,
    audioAssetDirtyRef,
    audioRevisionRef,
    onSave: handleSave,
    onClearError: () => setSaveError(null),
    onError: (error) => setSaveError(error instanceof Error ? error.message : 'PROJECT_SAVE_FAILED'),
  });

  const { isExporting, exportError, setExportError, handleExport } = useEditorExport({
    projectName: projectName ?? projectDocument?.metadata?.name ?? 'WallCut Project',
    fps: editor.timeline.fps,
    timeline,
    visualTimeline: editorTimeline,
    background: projectBackground,
    project: projectDocument ? buildProjectSnapshot : undefined,
    audioTracks,
    localizedError: t.editor.exportError,
  });

  const goToDashboard = useCallback(async () => {
    try {
      await autosaveController.flush();
    } catch {
      /* save error is already surfaced in UI */
    }
    window.location.href = '/';
  }, [autosaveController]);

  const handleTimelineFrameChange = useCallback(
    (frame: number) => {
      // Update the playhead immediately, then seek after React has flushed the
      // selection/state changes triggered by the same click.
      setCurrentFrame(frame);
      window.requestAnimationFrame(() => {
        playerRef.current?.seekTo(frame);
        setCurrentFrame(frame);
      });
    },
    [setCurrentFrame],
  );

  return (
    <div
      data-app-theme={theme}
      onContextMenu={handleEditorContextMenu}
      onClick={closeContextMenu}
      style={{
        width: '100%',
        height: '100%',

        display: 'flex',
        flexDirection: 'column',

        background:
          theme === 'classic'
            ? '#181818'
            : theme === 'graphite'
              ? '#171b22'
              : theme === 'ocean'
                ? '#071a24'
                : theme === 'plum'
                  ? '#1b1422'
                  : '#edf2f7',
        color:
          theme === 'ocean'
            ? '#e3f7ff'
            : theme === 'plum'
              ? '#f5eaff'
              : theme === 'graphite'
                ? '#edf2f7'
                : '#fff',

        overflow: 'hidden',

        minWidth: 0,
        minHeight: 0,
      }}
    >
      <div
        style={{
          flex: '0 0 auto',

          minWidth: 0,
          minHeight: 0,
        }}
      >
        <EditorHeader
          theme={theme}
          onThemeChange={setTheme}
          isDirty={hasProjectChanges}
          canUndo={editor.canUndo}
          canRedo={editor.canRedo}
          currentFrame={editor.currentFrame}
          onSave={handleSaveProject}
          isSaving={isSaving}
          saveError={saveError}
          onUndo={editor.undo}
          onRedo={editor.redo}
          onGroup={editor.groupSelectedBlocks}
          onUngroup={editor.ungroupSelectedBlock}
          canGroup={editor.selectedBlockIds.length >= 2}
          canUngroup={
            editor.selectedBlock?.block.type === 'group' &&
            !editor.selectedBlock.editorId.includes('/')
          }
          onDashboard={goToDashboard}
          onExport={handleExport}
          isExporting={isExporting}
          exportError={exportError}
          setExportError={setExportError}
        />
        <div
          aria-live="polite"
          style={{
            minHeight: 18,
            padding: '0 16px 4px',
            fontSize: 11,
            color: autosaveStatus === 'error' ? '#e99' : '#777',
          }}
        >
          {autosaveStatus === 'saving'
            ? 'Saving…'
            : autosaveStatus === 'scheduled'
              ? 'Changes will be saved automatically'
              : autosaveStatus === 'error'
                ? 'Autosave failed — changes are still local'
                : ''}
        </div>
      </div>

      <div
        style={{
          flex: '1 1 0',

          minWidth: 0,
          minHeight: 0,

          overflow: 'hidden',

          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <EditorWorkspace
          timeline={editor.timeline}
          editorTimeline={editor.editorTimeline}
          projectBackground={projectBackground}
          onProjectBackgroundChange={setProjectBackground}
          editorDuration={editor.editorDuration}
          activeBlocks={editor.activeBlocks}
          selectedBlockId={editor.selectedBlockId}
          selectedBlockIds={editor.selectedBlockIds}
          selectBlock={(id, additive = false) => {
            setAudioSelectedId(null);
            editor.selectBlock(id, additive);
          }}
          inspectorProps={editor.inspectorProps}
          handleAddBlock={editor.handleAddBlock}
          handleMove={editor.handleMove}
          handleResize={editor.handleResize}
          handleRotate={editor.handleRotate}
          handleResizeSelection={editor.handleResizeSelection}
          handleRotateSelection={editor.handleRotateSelection}
          setCurrentFrame={editor.setCurrentFrame}
          onPlayerRef={handlePlayerRef}
          beginInteraction={editor.beginInteraction}
          endInteraction={editor.endInteraction}
          onStackChildTextChange={editor.onStackChildTextChange}
          audioTracks={audioTracks}
          scenes={editor.runtimeTimeline.segments}
          selectedSceneId={editor.selectedSceneId}
          onSceneSelect={(sceneId) => {
            setAudioSelectedId(null);
            editor.selectScene(sceneId);
          }}
          onSceneAdd={editor.addScene}
          onSceneDuplicate={(sceneId) => editor.duplicateScene(sceneId)}
          onSceneDelete={(sceneId) => editor.deleteScene(sceneId)}
          onSceneReorder={editor.reorderScenes}
        />
      </div>

      <div
        style={{
          // Fill the available width without consuming extra vertical space.
          flex: '0 0 auto',
          width: '100%',
          minWidth: 0,
          minHeight: 0,
          boxSizing: 'border-box',
        }}
      >
        <EditorTimeline
          blocks={editor.resolvedBlocks}
          segments={editor.runtimeTimeline.segments}
          timeline={editor.runtimeTimeline}
          selectedBlockId={editor.selectedBlockId}
          currentFrame={editor.currentFrame}
          durationInFrames={editor.editorDuration}
          fps={30}
          onSelect={(id) => {
            editor.setSelectedBlockId(id);
            if (id !== null) {
              setAudioSelectedId(null);
            }
          }}
          onFrameChange={handleTimelineFrameChange}
          onMoveBlock={editor.handleTimelineBlockMove}
          onResizeBlock={editor.handleTimelineBlockResize}
          onChangeBlockLayer={editor.handleTimelineBlockLayerChange}
          onInteractionStart={editor.beginInteraction}
          onInteractionEnd={editor.endInteraction}
          audioTracks={audioTracks}
          onAudioStateChange={updateAudioTrack}
          onAudioAdd={handleAudioAdd}
          audioSelectedId={audioSelectedId}
          onAudioSelect={(trackId) => {
            editor.setSelectedBlockId(null);
            editor.clearSceneSelection();
            setAudioSelectedId(trackId);
            setContextMenu(null);
          }}
          onAudioContextMenu={handleAudioContextMenu}
          selectedSceneId={editor.selectedSceneId}
          onSceneSelect={(sceneId) => {
            setAudioSelectedId(null);
            editor.selectScene(sceneId);
          }}
          onSceneAdd={editor.addScene}
          onSceneReorder={editor.reorderScenes}
          onSceneDuplicate={editor.duplicateScene}
          onSceneDelete={editor.deleteScene}
          onSceneDurationChange={editor.setSceneDuration}
          onSplitBlock={editor.splitBlockAtFrame}
          onSplitAudio={handleSplitAudioTrack}
        />
      </div>

      <EditorContextMenu
        contextMenu={contextMenu}
        audioTracks={audioTracks}
        translations={t}
        onUpdateAudioTrack={updateAudioTrack}
        onDeleteAudioTrack={deleteAudioTrack}
        onRunAction={runContextAction}
        actions={[
          [t.contextMenu.copy, editor.copySelectedBlock, !editor.selectedBlockIds.length],
          [t.contextMenu.duplicate, editor.duplicateSelectedBlock, !editor.selectedBlockIds.length],
          [t.contextMenu.delete, editor.deleteSelectedBlock, !editor.selectedBlockIds.length],
          [t.contextMenu.moveForward, editor.moveSelectedForward, !editor.selectedBlockIds.length],
          [t.contextMenu.moveBackward, editor.moveSelectedBackward, !editor.selectedBlockIds.length],
          [t.contextMenu.bringToFront, editor.bringSelectedToFront, !editor.selectedBlockIds.length],
          [t.contextMenu.sendToBack, editor.sendSelectedToBack, !editor.selectedBlockIds.length],
          [t.contextMenu.paste, editor.pasteBlock, !editor.hasClipboard],
        ]}
      />
    </div>
  );
};
