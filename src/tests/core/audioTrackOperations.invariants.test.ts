import { fingerprintAudioTracks, splitAudioTrack, type EditorAudioTrack } from '../../editor/timeline/audioTrackOperations';
import { assert, assertEqual } from './testUtils';

export function runAudioTrackOperationsInvariantTests(): void {
  const source: EditorAudioTrack = {
    id: 'audio-1',
    binary: new ArrayBuffer(4),
    fileName: 'music.wav',
    mimeType: 'audio/wav',
    publicPath: 'blob:shared-audio',
    state: {
      startFrame: 10,
      durationFrames: 20,
      sourceStartFrame: 5,
      sourceEndFrame: 25,
      volume: 1,
      muted: false,
    },
  } as EditorAudioTrack;
  const other = { ...source, id: 'audio-2', state: { ...source.state, startFrame: 40 } };
  const tracks = [source, other];

  const split = splitAudioTrack(tracks, 'audio-1', 18, 'audio-3');
  assert(split.didSplit, 'splitting inside a track should succeed');
  assertEqual(split.tracks.length, 3, 'split creates one additional timeline segment');
  assertEqual(split.tracks[0].state.durationFrames, 8, 'first segment ends at the split frame');
  assertEqual(split.tracks[0].state.sourceEndFrame, 13, 'first segment source range is trimmed');
  assertEqual(split.tracks[1].state.startFrame, 18, 'second segment starts at the split frame');
  assertEqual(split.tracks[1].state.sourceStartFrame, 13, 'second segment source range advances');
  assertEqual(split.tracks[1].state.durationFrames, 12, 'second segment keeps remaining duration');
  assertEqual(split.tracks[1].publicPath, source.publicPath, 'segments share the same playback URL');
  assertEqual(split.tracks[2].id, 'audio-2', 'unrelated tracks retain their order');

  assert(!splitAudioTrack(tracks, 'audio-1', 10, 'unused').didSplit, 'split at start is rejected');
  assert(!splitAudioTrack(tracks, 'audio-1', 30, 'unused').didSplit, 'split at end is rejected');
  assert(!splitAudioTrack(tracks, 'missing', 18, 'unused').didSplit, 'unknown track is rejected');
  assertEqual(fingerprintAudioTracks(tracks), fingerprintAudioTracks(tracks), 'audio fingerprint is stable');
  assertEqual(tracks[0].publicPath, 'blob:shared-audio', 'split leaves source tracks unchanged');
}
