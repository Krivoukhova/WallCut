import { hasProjectChanges, type ProjectChangeState } from '../../application/project/hasProjectChanges';
import { assert, assertEqual } from './testUtils';

const unchangedState: ProjectChangeState = {
  editorDirty: false,
  audioFingerprint: 'audio-a',
  savedAudioFingerprint: 'audio-a',
  audioAssetsDirty: false,
  projectName: 'Project',
  savedProjectName: 'Project',
  backgroundFingerprint: 'background-a',
  savedBackgroundFingerprint: 'background-a',
};

export function runHasProjectChangesInvariantTests(): void {
  assertEqual(hasProjectChanges(unchangedState), false, 'unchanged project is not dirty');
  assertEqual(hasProjectChanges({ ...unchangedState, editorDirty: true }), true, 'visual edits mark project dirty');
  assertEqual(hasProjectChanges({ ...unchangedState, audioFingerprint: 'audio-b' }), true, 'audio edits mark project dirty');
  assertEqual(hasProjectChanges({ ...unchangedState, audioAssetsDirty: true }), true, 'audio asset edits mark project dirty');
  assertEqual(hasProjectChanges({ ...unchangedState, projectName: 'Renamed' }), true, 'renaming marks project dirty');
  assertEqual(hasProjectChanges({ ...unchangedState, backgroundFingerprint: 'background-b' }), true, 'background edits mark project dirty');
  assert(hasProjectChanges({ ...unchangedState, savedBackgroundFingerprint: 'background-old' }), 'saved background mismatch is detected');
}
