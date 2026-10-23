import { assertEqual, assert } from './testUtils';

import {
  constrainAnimationToBlock,
  getRequiredAnimationDuration,
} from '../../domain/animation/animation';
import {
  DEFAULT_SCENE_DURATION_FRAMES,
  MIN_SCENE_DURATION_FRAMES,
  getSceneStartFrame,
  getTimelineDuration,
  resolveSceneDuration,
} from '../../domain/timeline/duration';

export function runDurationInvariantTests(): void {
  assertEqual(
    resolveSceneDuration(undefined),
    DEFAULT_SCENE_DURATION_FRAMES,
    'missing scene duration uses the canonical default',
  );
  assertEqual(
    resolveSceneDuration(1),
    MIN_SCENE_DURATION_FRAMES,
    'scene duration is clamped to the canonical minimum',
  );
  assertEqual(resolveSceneDuration(45.4), 45, 'scene duration is normalized to whole frames');

  const segments = [{ durationFrames: 30 }, { durationFrames: undefined }, { durationFrames: 45 }];

  assertEqual(getSceneStartFrame(segments, 0), 0, 'first scene starts at frame zero');
  assertEqual(
    getSceneStartFrame(segments, 1),
    30,
    'scene start uses the canonical duration policy',
  );
  assertEqual(
    getSceneStartFrame(segments, 2),
    180,
    'scene start remains stable across mixed durations',
  );
  assertEqual(
    getTimelineDuration(segments),
    225,
    'timeline duration uses the same policy as scene starts',
  );
  assert(
    getSceneStartFrame(segments, 3) === getTimelineDuration(segments),
    'end position equals canonical timeline duration',
  );

  assertEqual(
    getRequiredAnimationDuration({
      enter: 'fade',
      duration: 15,
      delay: 5,
      exit: 'none',
      exitDuration: 30,
      exitDelay: 20,
    }),
    20,
    'disabled exit timing must not extend the required duration',
  );
  assertEqual(
    getRequiredAnimationDuration({
      enter: 'fade',
      duration: 15,
      delay: 5,
      exit: 'fade',
      exitDuration: 10,
      exitDelay: 4,
    }),
    20,
    'active enter and exit timing share the block and do not add together',
  );

  const constrained = constrainAnimationToBlock(
    {
      enter: 'fade',
      duration: 40,
      delay: 20,
      exit: 'fade',
      exitDuration: 30,
      exitDelay: 20,
    },
    20,
  );

  assertEqual(constrained.duration, 20, 'enter duration fits inside block');
  assertEqual(constrained.delay, 0, 'enter delay is reduced when duration consumes the block');
  assertEqual(constrained.exitDuration, 20, 'exit duration fits inside block');
  assertEqual(constrained.exitDelay, 0, 'exit delay is reduced when duration consumes the block');

  const noExit = constrainAnimationToBlock(
    { enter: 'fade', duration: 10, delay: 5, exit: 'none', exitDuration: 100, exitDelay: 100 },
    20,
  );
  assertEqual(noExit.duration, 10, 'disabled exit does not affect enter timing');
  assertEqual(noExit.delay, 5, 'disabled exit does not affect enter delay');

  const timingBounded = constrainAnimationToBlock(
    { enter: 'fade', duration: 50, delay: 50, exit: 'fade', exitDuration: 40, exitDelay: 40 },
    20,
  );
  assert(
    timingBounded.delay + timingBounded.duration <= 20,
    'enter timing always fits inside block duration',
  );
  assert(
    timingBounded.exitDelay + timingBounded.exitDuration <= 20,
    'exit timing always fits inside block duration',
  );
}
