import { assertEqual } from './testUtils';
import { compileRenderModel } from '../../renderer/renderModel';
import { DEFAULT_BACKGROUND } from '../../domain/background/backgroundTypes';

export function runRenderModelInvariantTests(): void {
  const model = compileRenderModel(
    {
      segments: [
        { id: 'scene-1', name: 'Intro', durationFrames: 30, blocks: [] },
        { id: 'scene-2', name: 'Body', durationFrames: 45, blocks: [] },
      ],
    },
    30,
  );

  assertEqual(model.scenes[0].startFrame, 0, 'first render scene starts at zero');
  assertEqual(model.scenes[0].durationFrames, 30, 'first scene keeps editor duration');
  assertEqual(model.scenes[1].startFrame, 30, 'second scene starts after first scene');
  assertEqual(model.durationInFrames, 75, 'render duration is derived from scenes');
  assertEqual(model.fps, 30, 'render model preserves composition fps');
  assertEqual(
    model.scenes[0].background,
    DEFAULT_BACKGROUND,
    'render scenes get the default background when no background is configured',
  );

  const projectBackground = { type: 'solid' as const, color: '#123456' };
  const sceneBackground = { type: 'solid' as const, color: '#abcdef' };
  const backgroundModel = compileRenderModel(
    {
      segments: [
        { id: 'inherit', durationFrames: 10, blocks: [] },
        { id: 'override', durationFrames: 10, blocks: [], background: sceneBackground },
      ],
    },
    30,
    [],
    projectBackground,
  );
  assertEqual(
    backgroundModel.scenes[0].background,
    projectBackground,
    'scene inherits the project background in the render model',
  );
  assertEqual(
    backgroundModel.scenes[1].background,
    sceneBackground,
    'scene-specific background takes priority in the render model',
  );
}
