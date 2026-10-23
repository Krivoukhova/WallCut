import {
  calculateLeftResize,
  calculateRightResize,
  getSegmentFrameBounds,
} from '../../editor/timeline/timelineBlockResize';
import {
  calculateTimelineMove,
  findMoveTargetSegment,
  findSceneQualifiedBlockLocation,
  hasCrossedSceneBoundary,
  isNestedTimelineBlock,
  resolveTimelineDragAxis,
} from '../../editor/timeline/timelineBlockMove';
import {
  createTransferredBlockSnapshot,
  resolveConfirmedMoveEditorId,
  resolveInteractingBlock,
} from '../../editor/timeline/timelineBlockInteractionLifecycle';
import { consumeHandledPointerEvent } from '../../editor/timeline/timelinePointerEvents';
import {
  restoreCancelledBlockInteraction,
  shouldCommitTrackDrop,
} from '../../editor/timeline/timelineBlockInteractionEnd';
import { assert, assertEqual } from './testUtils';

const moveSegments = [
  { id: 'scene-a', startFrame: 0, durationFrames: 30 },
  { id: 'scene-b', startFrame: 30, durationFrames: 30 },
];
const moveBlock = {
  editorId: 'scene-a:block-1',
  segmentId: 'scene-a',
  absoluteStartFrame: 20,
  duration: 8,
  index: 0,
  block: { id: 'block-1', type: 'text' },
} as unknown as import('../../editor/editorTypes').ResolvedEditorBlock;
const moveCalculation = calculateTimelineMove({
  interaction: {
    editorId: 'scene-a:block-1',
    originalStartFrame: 20,
    originalDuration: 8,
    startPointerFrame: 20,
  },
  block: moveBlock,
  segments:
    moveSegments as unknown as import('../../domain/timeline/ttsTimelineTypes').TTSSegment[],
  pointerFrame: 32,
  snapCandidates: [],
  durationInFrames: 60,
  segmentStart: 0,
  segmentEnd: 30,
});
assertEqual(moveCalculation.rawStart, 32, 'move calculation preserves pointer delta');
assertEqual(moveCalculation.rawTargetSegment?.id, 'scene-b', 'move target uses the clip left edge');
assertEqual(moveCalculation.crossesSceneBoundary, true, 'move calculation detects scene transfer');
assertEqual(moveCalculation.nextStart, 32, 'cross-scene move avoids snapping across the boundary');

type Segment = {
  startFrame: number;
  durationInFrames: number;
};

export function runTimelineInvariantTests(): void {
  const handledPointerEvents = new WeakSet<Event>();
  const pointerMoveEvent = new Event('pointermove');
  assertEqual(
    consumeHandledPointerEvent(pointerMoveEvent, handledPointerEvents),
    false,
    'unhandled pointer events remain available to the window fallback',
  );
  handledPointerEvents.add(pointerMoveEvent);
  assertEqual(
    consumeHandledPointerEvent(pointerMoveEvent, handledPointerEvents),
    true,
    'window fallback consumes pointer events already handled by React',
  );
  assertEqual(
    consumeHandledPointerEvent(pointerMoveEvent, handledPointerEvents),
    false,
    'handled pointer event is consumed only once',
  );
  const restoreCalls: unknown[][] = [];
  const restoreCallbacks = {
    onMoveBlock: (...args: [string, number]) => {
      restoreCalls.push(['move', ...args]);
    },
    onResizeBlock: (...args: [string, number, number]) => {
      restoreCalls.push(['resize', ...args]);
    },
  };
  restoreCancelledBlockInteraction(
    { type: 'move', editorId: 'scene-a/block-1', originalStartFrame: 12, originalDuration: 20 },
    restoreCallbacks,
  );
  assertEqual(
    restoreCalls[0].join('|'),
    'move|scene-a/block-1|12',
    'cancelled move restores its original start frame',
  );
  restoreCancelledBlockInteraction(
    {
      type: 'resize-left',
      editorId: 'scene-a/block-1',
      originalStartFrame: 12,
      originalDuration: 20,
    },
    restoreCallbacks,
  );
  assertEqual(
    restoreCalls[1].join('|'),
    'resize|scene-a/block-1|12|20',
    'cancelled resize restores both original timing values',
  );
  assertEqual(
    shouldCommitTrackDrop(true, false, 'move'),
    true,
    'completed move may commit a track drop',
  );
  assertEqual(
    shouldCommitTrackDrop(true, true, 'move'),
    false,
    'cancelled move never commits a track drop',
  );
  assertEqual(
    shouldCommitTrackDrop(true, false, 'resize-right'),
    false,
    'resize never commits a track drop',
  );
  assertEqual(
    shouldCommitTrackDrop(false, false, 'move'),
    false,
    'click without dragging never commits a track drop',
  );

  const valid: Segment = { startFrame: 30, durationInFrames: 45 };

  assert(valid.startFrame >= 0, 'segment start must be non-negative');
  assert(valid.durationInFrames >= 1, 'segment duration must be positive');
  assertEqual(valid.startFrame + valid.durationInFrames, 75, 'segment end frame');

  const segments: Segment[] = [
    { startFrame: 0, durationInFrames: 30 },
    { startFrame: 30, durationInFrames: 60 },
  ];

  for (let i = 1; i < segments.length; i += 1) {
    const previous = segments[i - 1];
    const current = segments[i];
    assert(
      current.startFrame >= previous.startFrame + previous.durationInFrames,
      'ordered segments must not overlap',
    );
  }

  const resizeBounds = { start: 20, end: 80 };
  const leftResize = calculateLeftResize({
    originalStartFrame: 30,
    originalDuration: 20,
    pointerFrame: 35,
    startPointerFrame: 30,
    snapCandidates: [],
    segmentStart: resizeBounds.start,
    segmentEnd: resizeBounds.end,
  });
  assertEqual(leftResize.startFrame, 35, 'left resize follows pointer delta');
  assertEqual(leftResize.duration, 15, 'left resize preserves original end');

  const boundedLeftResize = calculateLeftResize({
    originalStartFrame: 30,
    originalDuration: 20,
    pointerFrame: 100,
    startPointerFrame: 30,
    snapCandidates: [],
    segmentStart: resizeBounds.start,
    segmentEnd: resizeBounds.end,
  });
  assertEqual(boundedLeftResize.startFrame, 49, 'left resize preserves minimum duration');
  assertEqual(boundedLeftResize.duration, 1, 'left resize cannot collapse block');

  const rightResize = calculateRightResize({
    originalStartFrame: 30,
    originalDuration: 20,
    pointerFrame: 40,
    startPointerFrame: 30,
    snapCandidates: [],
    segmentEnd: resizeBounds.end,
  });
  assertEqual(rightResize.startFrame, 30, 'right resize preserves start');
  assertEqual(rightResize.duration, 30, 'right resize follows pointer delta');

  const boundedRightResize = calculateRightResize({
    originalStartFrame: 30,
    originalDuration: 20,
    pointerFrame: 100,
    startPointerFrame: 30,
    snapCandidates: [],
    segmentEnd: 80,
  });
  assertEqual(boundedRightResize.duration, 50, 'right resize stops at segment end');

  const moveSegments = [
    { id: 'scene-a', startFrame: 0, durationFrames: 30 },
    { id: 'scene-b', startFrame: 30, durationFrames: 40 },
  ];
  assertEqual(
    findMoveTargetSegment(moveSegments, 0)?.id,
    'scene-a',
    'move target includes segment start',
  );
  assertEqual(
    findMoveTargetSegment(moveSegments, 30)?.id,
    'scene-b',
    'move target switches at exact scene boundary',
  );
  assertEqual(
    findMoveTargetSegment(moveSegments, 70)?.id,
    'scene-b',
    'last segment accepts its end boundary fallback',
  );
  assertEqual(
    resolveTimelineDragAxis(2, 12),
    'vertical',
    'vertical track drag ignores minor horizontal pointer jitter',
  );
  assertEqual(
    resolveTimelineDragAxis(12, 2),
    'horizontal',
    'horizontal timing drag preserves horizontal movement',
  );
  assertEqual(
    resolveTimelineDragAxis(-1, -8),
    'vertical',
    'drag axis detection is direction independent',
  );
  assertEqual(
    findMoveTargetSegment(moveSegments, -1),
    undefined,
    'move target rejects positions before first segment',
  );
  assert(
    hasCrossedSceneBoundary('scene-a', 'scene-b'),
    'different scenes count as crossing a boundary',
  );
  assert(
    !hasCrossedSceneBoundary('scene-a', 'scene-a'),
    'same scene does not count as crossing a boundary',
  );
  assert(
    !hasCrossedSceneBoundary('scene-a', undefined),
    'missing target scene is not a boundary crossing',
  );
  assert(isNestedTimelineBlock('scene-a:group/child'), 'nested editor IDs are recognized');
  assert(!isNestedTimelineBlock('scene-a:clip'), 'top-level editor IDs are not nested');
  const duplicatedLocalIdScenes = [
    { id: 'scene-a', blocks: [{ id: 'shared-id', marker: 'first-scene' }] },
    { id: 'scene-b', blocks: [{ id: 'shared-id', marker: 'second-scene' }] },
  ];
  const qualifiedLocation = findSceneQualifiedBlockLocation(
    duplicatedLocalIdScenes,
    'scene-b',
    'shared-id',
  );
  assert(
    qualifiedLocation !== undefined,
    'scene-qualified lookup finds a duplicate ID in the requested scene',
  );
  if (qualifiedLocation === undefined) {
    throw new Error('scene-qualified lookup failed for the requested source scene');
  }
  assertEqual(
    qualifiedLocation.segmentIndex,
    1,
    'duplicate local IDs resolve only in the requested source scene',
  );
  assertEqual(
    duplicatedLocalIdScenes[qualifiedLocation.segmentIndex].blocks[qualifiedLocation.blockIndex]
      .marker,
    'second-scene',
    'scene-qualified lookup never selects the same-ID block in another scene',
  );
  assertEqual(
    findSceneQualifiedBlockLocation(duplicatedLocalIdScenes, 'missing-scene', 'shared-id'),
    undefined,
    "missing source scene does not fall back to another scene's duplicate ID",
  );

  const originalBlock = {
    editorId: 'scene-a:clip-1',
    segmentId: 'scene-a',
    absoluteStartFrame: 12,
    segmentDuration: 30,
    duration: 8,
    block: { id: 'clip-1', startFrame: 12 },
  };
  const replacementBlock = {
    ...originalBlock,
    editorId: 'scene-b:clip-1',
  };
  assertEqual(
    resolveInteractingBlock([replacementBlock as never], 'scene-b:clip-1', originalBlock as never)
      .editorId,
    'scene-b:clip-1',
    'interaction lifecycle resolves the latest block by full editor ID',
  );
  assertEqual(
    resolveInteractingBlock([], 'scene-b:clip-1', originalBlock as never).editorId,
    'scene-a:clip-1',
    'interaction lifecycle retains the previous snapshot during transfer',
  );
  const transferredSnapshot = createTransferredBlockSnapshot(
    originalBlock as never,
    'scene-b:clip-1',
    { id: 'scene-b', startFrame: 30 },
    36,
  );
  assertEqual(
    transferredSnapshot.segmentId,
    'scene-b',
    'transferred snapshot uses destination scene',
  );
  assertEqual(
    transferredSnapshot.absoluteStartFrame,
    36,
    'transferred snapshot preserves absolute position',
  );
  assertEqual(
    transferredSnapshot.block.startFrame,
    6,
    'transferred snapshot computes destination-local position',
  );
  // The interaction ID must remain tied to the source block unless the move
  // callback explicitly confirms a transfer and returns the new qualified ID.
  assertEqual(
    resolveConfirmedMoveEditorId('scene-b:clip-1', undefined),
    'scene-b:clip-1',
    'an unconfirmed pointer target must not rebind the drag to another scene',
  );
  assertEqual(
    resolveConfirmedMoveEditorId('scene-a:clip-1', 'scene-b:clip-1'),
    'scene-b:clip-1',
    'a confirmed transfer follows the same block into the destination scene',
  );

  const segmentBounds = getSegmentFrameBounds(
    { startFrame: 40, durationFrames: 25 } as never,
    { absoluteStartFrame: 50, segmentDuration: 60, block: { startFrame: 10 } } as never,
  );
  assertEqual(segmentBounds.start, 40, 'segment bounds use segment start');
  assertEqual(segmentBounds.end, 65, 'segment bounds use segment duration');
}
