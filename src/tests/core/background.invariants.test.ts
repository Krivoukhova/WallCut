import { DEFAULT_BACKGROUND, resolveBackground } from '../../domain/background/backgroundTypes';
import type { BackgroundStyle } from '../../domain/background/backgroundTypes';
import { assert, assertEqual } from './testUtils';

export function runBackgroundInvariantTests(): void {
  const projectBackground: BackgroundStyle = { type: 'solid', color: '#123456' };
  const sceneBackground: BackgroundStyle = { type: 'solid', color: '#abcdef' };

  assertEqual(
    resolveBackground(sceneBackground, projectBackground),
    sceneBackground,
    'scene background overrides the project background',
  );
  assertEqual(
    resolveBackground(undefined, projectBackground),
    projectBackground,
    'scene without override inherits the project background',
  );
  assertEqual(
    resolveBackground(null, projectBackground),
    projectBackground,
    'null scene override inherits the project background',
  );
  assertEqual(
    resolveBackground(undefined, undefined),
    DEFAULT_BACKGROUND,
    'missing project and scene backgrounds use the default',
  );
  assert(isBackgroundFallbackStable(), 'default background is a serializable solid color');
}

function isBackgroundFallbackStable(): boolean {
  return (
    DEFAULT_BACKGROUND.type === 'solid' &&
    typeof DEFAULT_BACKGROUND.color === 'string' &&
    DEFAULT_BACKGROUND.color.length > 0
  );
}
