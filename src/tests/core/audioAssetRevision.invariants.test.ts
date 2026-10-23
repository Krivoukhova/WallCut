import { canClearAudioAssetDirtyFlag } from '../../application/project/audioAssetRevision';
import { assert, assertEqual } from './testUtils';

export function runAudioAssetRevisionInvariantTests(): void {
  assert(canClearAudioAssetDirtyFlag(4, 4), 'matching revisions allow the dirty flag to clear');
  assertEqual(
    canClearAudioAssetDirtyFlag(5, 4),
    false,
    'a newer audio edit must remain dirty after an older save completes',
  );
  assertEqual(
    canClearAudioAssetDirtyFlag(3, 4),
    false,
    'a revision mismatch never clears the dirty flag',
  );
}
