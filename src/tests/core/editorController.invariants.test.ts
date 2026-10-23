import {
  createEditorController,
  type EditorControllerState,
} from '../../application/editor/EditorController';
import type { VisualTimelineData } from '../../domain/timeline/visualTimelineTypes';
import { assert, assertEqual } from './testUtils';

const clone = <T>(value: T): T => structuredClone(value);

export function runEditorControllerInvariantTests(): void {
  let current: VisualTimelineData = {
    segments: [
      { id: 'a', name: 'A', blocks: [] },
      { id: 'b', name: 'B', blocks: [] },
      { id: 'c', name: 'C', blocks: [] },
    ],
  };

  let nextId = 0;
  const controller = createEditorController(
    (updater) => {
      current = updater(current);
      return current;
    },
    { generate: () => `generated-${++nextId}` },
    { clone },
  );

  const staleTimeline = clone(current);
  current = { ...current, segments: [...current.segments, { id: 'd', name: 'D', blocks: [] }] };

  const state: EditorControllerState = { selection: { type: 'none' }, currentFrame: 0 };
  controller.reorderScenes(state, staleTimeline, 'd', 0, (index) => index * 100);
  assertEqual(
    current.segments.map((segment) => segment.id).join(','),
    'd,a,b,c',
    'reorder must use current timeline, not stale input',
  );

  controller.duplicateScene(state, staleTimeline, 'd', (index) => index * 100);
  assertEqual(current.segments.length, 5, 'duplicate must use current timeline');
  assertEqual(current.segments[1].name, 'D копия', 'duplicate must duplicate the current scene');

  controller.deleteScene(state, staleTimeline, 'd', (index) => index * 100);
  assert(
    !current.segments.some((segment) => segment.id === 'd'),
    'delete must use current timeline',
  );

  controller.setSceneDuration(staleTimeline, 'c', 1);
  const c = current.segments.find((segment) => segment.id === 'c');
  assert(
    c !== undefined && c.durationFrames !== undefined && c.durationFrames >= 15,
    'duration mutation must target current scene and use canonical minimum',
  );
}
