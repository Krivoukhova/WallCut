import type { ShortsProject } from '../../domain/project/projectTypes';
import type { EditorAudioTrack } from '../../editor/timeline/audioTrackOperations';
import { buildAudioAssetPatch } from '../../application/project/buildAudioAssetPatch';
import { buildProjectUpdatePatch } from '../../application/project/buildProjectUpdatePatch';
import { assert, assertEqual } from './testUtils';

export function runBuildProjectUpdatePatchInvariantTests(): void {
  const project = { metadata: { name: 'WallCut' } } as ShortsProject;
  const patchWithoutAudio = buildProjectUpdatePatch({ name: 'WallCut', project, audioAssets: undefined });
  assertEqual(patchWithoutAudio.name, 'WallCut', 'update patch carries the project name');
  assertEqual(patchWithoutAudio.project, project, 'update patch carries the project snapshot');
  assert(!('audioAssets' in patchWithoutAudio), 'clean audio assets are omitted rather than overwritten');

  const track = {
    id: 'audio-1',
    binary: new ArrayBuffer(4),
    state: { startFrame: 0, durationFrames: 10 },
  } as unknown as EditorAudioTrack;
  const audioAssets = buildAudioAssetPatch([track], true);
  const patchWithAudio = buildProjectUpdatePatch({ project, audioAssets });
  assertEqual(patchWithAudio.audioAssets, audioAssets, 'update patch carries dirty audio assets unchanged');
  assert('audioAssets' in patchWithAudio, 'dirty empty audio arrays can explicitly clear stored assets');
  const clearPatch = buildProjectUpdatePatch({ project, audioAssets: [] });
  assertEqual(clearPatch.audioAssets?.length, 0, 'empty dirty audio list is preserved for clearing');
}
