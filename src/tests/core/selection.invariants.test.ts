import {
  blockSelection,
  getSelectedBlockId,
  getSelectedBlockIds,
  getSelectedSceneId,
  noSelection,
  sceneSelection,
} from '../../domain/editor/selection';
import { assert, assertEqual } from './testUtils';

export function runSelectionInvariantTests(): void {
  const none = noSelection();
  assertEqual(getSelectedBlockId(none), null, 'none has no active block');
  assertEqual(getSelectedSceneId(none), null, 'none has no scene');

  const scene = sceneSelection('scene-2');
  assertEqual(getSelectedSceneId(scene), 'scene-2', 'scene selection keeps scene id');
  assertEqual(getSelectedBlockIds(scene).length, 0, 'scene selection has no block ids');

  const blocks = blockSelection(['b1', 'b2', 'b1'], 'b2');
  assertEqual(getSelectedBlockIds(blocks).length, 2, 'block selection deduplicates ids');
  assertEqual(getSelectedBlockId(blocks), 'b2', 'active block belongs to the selection');

  const invalid = blockSelection(['b1'], 'missing');
  assert(invalid.type === 'none', 'invalid active block cannot create a block selection');
}
