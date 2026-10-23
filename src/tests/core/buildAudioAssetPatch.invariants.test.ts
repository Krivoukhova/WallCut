import type { EditorAudioTrack } from '../../editor/timeline/audioTrackOperations';
import { buildAudioAssetPatch } from '../../application/project/buildAudioAssetPatch';
import { assert, assertEqual } from './testUtils';

export function runBuildAudioAssetPatchInvariantTests(): void {
  const binary = new ArrayBuffer(8);
  const track = {
    id: 'audio-1',
    binary,
    publicPath: '/local/audio-1',
    fileName: 'voice.wav',
    mimeType: 'audio/wav',
    state: { startFrame: 10, durationFrames: 20, sourceStartFrame: 0, sourceEndFrame: 20 },
  } as unknown as EditorAudioTrack;

  assertEqual(buildAudioAssetPatch([track], false), undefined, 'clean audio assets are omitted');

  const patch = buildAudioAssetPatch([track], true);
  if (!patch) throw new Error('dirty audio assets produce a patch');
  assertEqual(patch.length, 1, 'patch contains each audio track once');
  assertEqual(patch[0].id, track.id, 'patch preserves track identity');
  assertEqual(patch[0].binary, binary, 'patch preserves the underlying binary');
  assertEqual(patch[0].state, track.state, 'patch preserves track state');
  assertEqual(patch[0].fileName, track.fileName, 'patch preserves the file name');
  assertEqual(patch[0].mimeType, track.mimeType, 'patch preserves MIME type');
  assert(!('publicPath' in patch[0]), 'patch excludes UI-only public paths');
  assertEqual(buildAudioAssetPatch([], true)?.length, 0, 'dirty empty audio list clears persisted assets');
}
