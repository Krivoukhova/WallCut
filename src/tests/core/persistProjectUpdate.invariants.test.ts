import { persistProjectUpdate } from '../../application/autosave/persistProjectUpdate';
import { assert, assertEqual } from './testUtils';

export async function runPersistProjectUpdateInvariantTests(): Promise<void> {
  const saved = { id: 'project-1', revision: 3 };
  const result = await persistProjectUpdate(async () => saved, 'PROJECT_SAVE_FAILED');
  assertEqual(result, saved, 'successful persistence returns the saved record');

  let rejected = false;
  try {
    await persistProjectUpdate(async () => null, 'PROJECT_AUTOSAVE_FAILED');
  } catch (error) {
    rejected = error instanceof Error && error.message === 'PROJECT_AUTOSAVE_FAILED';
  }
  assert(rejected, 'missing project must surface the caller-specific failure code');

  let propagated = false;
  try {
    await persistProjectUpdate(async () => { throw new Error('storage unavailable'); }, 'PROJECT_SAVE_FAILED');
  } catch (error) {
    propagated = error instanceof Error && error.message === 'storage unavailable';
  }
  assert(propagated, 'storage failures must not be masked');
}
