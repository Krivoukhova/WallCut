import { buildProjectSnapshot } from '../../application/project/buildProjectSnapshot';
import type { ShortsProject } from '../../domain/project/projectTypes';
import type { VisualTimelineData } from '../../domain/timeline/visualTimelineTypes';
import type { BackgroundStyle } from '../../domain/background/backgroundTypes';
import type { EditorAudioTrack } from '../../editor/timeline/audioTrackOperations';
import { assert, assertEqual } from './testUtils';

export function runProjectSnapshotInvariantTests(): void {
  const base = {
    metadata: { name: 'Original' },
    visualTimeline: { scenes: [] },
    audioTracks: [],
  } as unknown as ShortsProject;
  const visualTimeline = { scenes: [{ id: 'scene-new' }] } as unknown as VisualTimelineData;
  const background = { type: 'solid', color: '#000000' } as unknown as BackgroundStyle;
  const audioTracks = [
    {
      id: 'audio-1',
      fileName: 'voice.wav',
      mimeType: 'audio/wav',
      binary: new ArrayBuffer(0),
      publicPath: 'blob:audio',
      state: { startFrame: 0, durationFrames: 20 },
    },
  ] as unknown as EditorAudioTrack[];

  const snapshot = buildProjectSnapshot({ base, visualTimeline, background, audioTracks, projectName: 'Renamed' });
  assertEqual(snapshot.metadata?.name, 'Renamed', 'snapshot uses the current project name');
  assertEqual(snapshot.visualTimeline, visualTimeline, 'snapshot uses the current visual timeline');
  assertEqual(snapshot.background, background, 'snapshot uses the current background');
  assertEqual(snapshot.audioTracks?.length, 1, 'snapshot keeps audio track metadata');
  assertEqual(snapshot.audioTracks?.[0]?.fileName, 'voice.wav', 'snapshot keeps the audio filename');
  assert(!('binary' in (snapshot.audioTracks?.[0] ?? {})), 'snapshot must not embed audio binary data');

  let missingDocumentRejected = false;
  try {
    buildProjectSnapshot({ base: undefined, visualTimeline, background, audioTracks });
  } catch (error) {
    missingDocumentRejected = error instanceof Error && error.message === 'PROJECT_DOCUMENT_REQUIRED';
  }
  assert(missingDocumentRejected, 'snapshot requires a project document');
}
