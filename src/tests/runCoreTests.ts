import { runCoreTests } from './core/runCoreTests';

runCoreTests()
  .then(() => {
    console.log('All core tests passed.');
  })
  .catch((error: unknown) => {
    console.error('Core tests failed:', error);
    throw error;
  });
