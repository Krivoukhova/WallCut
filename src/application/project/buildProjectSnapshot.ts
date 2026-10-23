import type { BackgroundStyle } from '../../domain/background/backgroundTypes';
import type { ShortsProject } from '../../domain/project/projectTypes';
import type { VisualTimelineData } from '../../domain/timeline/visualTimelineTypes';
import type { EditorAudioTrack } from '../../editor/timeline/audioTrackOperations';

export type ProjectSnapshotInput = {
  base: ShortsProject | undefined;
  visualTimeline: VisualTimelineData;
  background: BackgroundStyle;
  audioTracks: EditorAudioTrack[];
  projectName?: string;
};

/** Build the persisted document from the editor's current in-memory state. */
export function buildProjectSnapshot(input: ProjectSnapshotInput): ShortsProject {
  const { base, visualTimeline, background, audioTracks, projectName } = input;
  if (!base) throw new Error('PROJECT_DOCUMENT_REQUIRED');

  return {
    ...base,
    visualTimeline,
    background,
    audioTracks: audioTracks.map(({ id, state, fileName, mimeType }) => ({
      id,
      fileName: fileName || undefined,
      mimeType: mimeType || undefined,
      state,
    })),
    metadata: { ...base.metadata, name: projectName ?? base.metadata?.name },
  };
}
