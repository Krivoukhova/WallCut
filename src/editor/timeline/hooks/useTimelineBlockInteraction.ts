import type React from 'react';
import { useCallback, useRef, useState } from 'react';
import type { ResolvedEditorBlock } from '../../editorTypes';
import type { TTSSegment } from '../../../domain/timeline/ttsTimelineTypes';
import type { InteractionState, TrackId } from '../timelineTypes';
import { DRAG_THRESHOLD_PX, TRACK_IDS } from '../timelineConstants';
import { getTrackId } from '../timelineUtils';
import {
  calculateLeftResize,
  calculateRightResize,
  getSegmentFrameBounds,
} from '../timelineBlockResize';
import { calculateTimelineMove, resolveTimelineDragAxis } from '../timelineBlockMove';
import {
  createTransferredBlockSnapshot,
  resolveConfirmedMoveEditorId,
  resolveInteractingBlock,
} from '../timelineBlockInteractionLifecycle';
import { useTimelineWindowPointerFallback } from './useTimelineWindowPointerFallback';
import { restoreCancelledBlockInteraction } from '../timelineBlockInteractionEnd';

export type TimelineBlockInteractionOptions = {
  blocks: ResolvedEditorBlock[];
  segments: TTSSegment[];
  durationInFrames: number;
  timelineRef: React.RefObject<HTMLDivElement | null>;
  getPointerFrame: (event: React.PointerEvent) => number;
  getSnapCandidates: (block: ResolvedEditorBlock) => number[];
  onSelect: (id: string | null) => void;
  onMoveBlock: (editorId: string, startFrame: number) => string | void;
  onResizeBlock: (editorId: string, startFrame: number, duration: number) => void;
  onChangeBlockLayer: (editorId: string, layer: TrackId) => void;
  onInteractionStart?: () => void;
  onInteractionEnd?: () => void;
};

export function useTimelineBlockInteraction({
  blocks,
  segments,
  durationInFrames,
  timelineRef,
  getPointerFrame,
  getSnapCandidates,
  onSelect,
  onMoveBlock,
  onResizeBlock,
  onChangeBlockLayer,
  onInteractionStart,
  onInteractionEnd,
}: TimelineBlockInteractionOptions) {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dropTrackId, setDropTrackId] = useState<TrackId | null>(null);
  const [dropSceneId, setDropSceneId] = useState<string | null>(null);
  const interactionRef = useRef<InteractionState | null>(null);
  // Lock move gestures to the dominant axis once dragging starts. This keeps
  // small horizontal pointer jitter during a vertical track drag from crossing
  // a scene boundary (a difference that can be more noticeable in Chromium).
  const dragAxisRef = useRef<'horizontal' | 'vertical' | null>(null);
  const handledPointerEventsRef = useRef<WeakSet<Event>>(new WeakSet());
  const suppressNextBlockClickRef = useRef(false);

  const getDropTrackId = useCallback(
    (event: React.PointerEvent): TrackId | null => {
      const timeline = timelineRef.current;

      if (!timeline) {
        return null;
      }

      const pointerX = event.clientX;

      const pointerY = event.clientY;

      const activeDraggingId = interactionRef.current?.editorId ?? draggingId;

      const elements = document.elementsFromPoint(pointerX, pointerY);

      for (const element of elements) {
        const htmlElement = element as HTMLElement;

        const blockElement = htmlElement.closest('[data-editor-block]') as HTMLElement | null;

        if (blockElement && activeDraggingId) {
          const blockEditorId = blockElement.dataset.editorId;

          if (blockEditorId === activeDraggingId) {
            continue;
          }
        }

        const trackElement = htmlElement.closest('[data-editor-track]') as HTMLElement | null;

        if (!trackElement) {
          continue;
        }

        const trackId = trackElement.dataset.editorTrack as TrackId | undefined;

        if (!trackId || !TRACK_IDS.includes(trackId)) {
          continue;
        }

        const rect = trackElement.getBoundingClientRect();

        if (pointerY >= rect.top && pointerY < rect.bottom) {
          return trackId;
        }
      }

      const trackElements = Array.from(
        timeline.querySelectorAll<HTMLElement>('[data-editor-track]'),
      );

      for (const trackElement of trackElements) {
        const trackId = trackElement.dataset.editorTrack as TrackId | undefined;

        if (!trackId || !TRACK_IDS.includes(trackId)) {
          continue;
        }

        const rect = trackElement.getBoundingClientRect();

        // A track is a horizontal lane: identify the drop target by its
        // vertical band, even when the pointer is beyond the visible/content
        // width of the lane (e.g. near a clipped block edge or during scroll).
        if (pointerY >= rect.top && pointerY < rect.bottom) {
          return trackId;
        }
      }

      return null;
    },
    [draggingId, timelineRef],
  );

  const beginBlockInteraction = useCallback(
    (
      event: React.PointerEvent,
      block: ResolvedEditorBlock,
      type: 'move' | 'resize-left' | 'resize-right',
    ) => {
      event.preventDefault();
      event.stopPropagation();

      onSelect(block.editorId);

      const pointerFrame = getPointerFrame(event);

      const interaction: InteractionState = {
        type,

        editorId: block.editorId,
        lastBlock: block,

        pointerStartX: event.clientX,

        pointerStartY: event.clientY,

        startPointerFrame: pointerFrame,

        originalStartFrame: block.absoluteStartFrame,

        originalDuration: block.duration,

        startFrame: block.absoluteStartFrame,

        duration: block.duration,

        dragging: false,
      };

      interactionRef.current = interaction;
      dragAxisRef.current = null;

      if (type === 'resize-left' || type === 'resize-right') {
        interaction.dragging = true;

        setDraggingId(block.editorId);

        onInteractionStart?.();
      }

      try {
        (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
      } catch {
        // Ignore.
      }
    },
    [getPointerFrame, onInteractionStart, onSelect],
  );

  const updateBlockInteraction = useCallback(
    (event: React.PointerEvent) => {
      const interaction = interactionRef.current;

      if (!interaction) {
        return;
      }

      handledPointerEventsRef.current.add(
        (event as React.PointerEvent).nativeEvent ?? (event as unknown as Event),
      );

      // Resolve by the full scene-qualified ID. Matching only the local
      // block ID can accidentally pick a different block from another scene
      // when IDs are reused, making unrelated clips appear to move together.
      const block = resolveInteractingBlock(blocks, interaction.editorId, interaction.lastBlock);
      // Keep the latest resolved snapshot. During a cross-scene transfer React
      // can briefly remove the old keyed element before the new one is resolved.
      interaction.lastBlock = block;

      // Timeline blocks are local to their TTS segment.
      // Resolve the absolute segment bounds once and use them for
      // move + both resize directions so an interaction can never
      // leak into a neighbouring speech segment.
      const segment = segments.find((item) => item.id === block.segmentId);

      const { start: segmentStart, end: segmentEnd } = getSegmentFrameBounds(segment, block);

      const distance = Math.sqrt(
        Math.pow(event.clientX - interaction.pointerStartX, 2) +
          Math.pow(event.clientY - interaction.pointerStartY, 2),
      );

      if (!interaction.dragging && distance < DRAG_THRESHOLD_PX) {
        return;
      }

      if (!interaction.dragging) {
        interaction.dragging = true;

        // Decide the gesture axis at drag start and keep it stable for this
        // interaction. Vertical-dominant drags change the track only; they
        // must not accidentally move the clip into a neighbouring scene due
        // to a few pixels of horizontal pointer jitter.
        const deltaX = Math.abs(event.clientX - interaction.pointerStartX);
        const deltaY = Math.abs(event.clientY - interaction.pointerStartY);
        dragAxisRef.current = resolveTimelineDragAxis(deltaX, deltaY);

        setDraggingId(interaction.editorId);

        onInteractionStart?.();
      }

      if (interaction.type === 'resize-left') {
        const pointerFrame = getPointerFrame(event);

        const { startFrame: nextStart, duration: nextDuration } = calculateLeftResize({
          originalStartFrame: interaction.originalStartFrame,
          originalDuration: interaction.originalDuration,
          pointerFrame,
          startPointerFrame: interaction.startPointerFrame,
          snapCandidates: getSnapCandidates(block),
          segmentStart,
          segmentEnd,
        });

        interaction.startFrame = nextStart;

        interaction.duration = nextDuration;

        onResizeBlock(interaction.editorId, nextStart, nextDuration);

        return;
      }

      if (interaction.type === 'resize-right') {
        const pointerFrame = getPointerFrame(event);

        const { duration: nextDuration } = calculateRightResize({
          originalStartFrame: interaction.originalStartFrame,
          originalDuration: interaction.originalDuration,
          pointerFrame,
          startPointerFrame: interaction.startPointerFrame,
          snapCandidates: getSnapCandidates(block),
          segmentEnd,
        });

        interaction.startFrame = interaction.originalStartFrame;

        interaction.duration = nextDuration;

        onResizeBlock(interaction.editorId, interaction.originalStartFrame, nextDuration);

        return;
      }

      if (interaction.type === 'move' && dragAxisRef.current === 'vertical') {
        setDropSceneId(block.segmentId ?? null);
        setDropTrackId(getDropTrackId(event));
        return;
      }

      const move = calculateTimelineMove({
        interaction,
        block,
        segments,
        pointerFrame: getPointerFrame(event),
        snapCandidates: getSnapCandidates(block),
        durationInFrames,
        segmentStart,
        segmentEnd,
      });
      const { rawTargetSegment, nextStart } = move;
      setDropSceneId(rawTargetSegment?.id ?? block.segmentId ?? null);

      interaction.startFrame = nextStart;
      const previousEditorId = interaction.editorId;
      const movedEditorId = resolveConfirmedMoveEditorId(
        previousEditorId,
        onMoveBlock(previousEditorId, nextStart),
      );

      if (movedEditorId !== previousEditorId) {
        // Keep tracking exactly the same clip after a scene transfer. The
        // receiving scene may already contain a block with the old local ID.
        interaction.editorId = movedEditorId;
        const movedTargetSegment = rawTargetSegment;
        if (movedTargetSegment) {
          interaction.lastBlock = createTransferredBlockSnapshot(
            block,
            movedEditorId,
            movedTargetSegment,
            nextStart,
          );
        }
        setDraggingId(movedEditorId);
      }
      // Do not rewrite the active editor ID from pointer geometry alone.
      // The block's identity changes scenes only when onMoveBlock confirms
      // a transfer by returning its new scene-qualified ID. Otherwise a
      // stale/temporary target calculation can bind this drag to a different
      // block with the same local ID in a neighbouring scene.

      // Only moving a block can target another track. Resizing is strictly
      // a horizontal duration operation and must never change its layer.
      if (interaction.type === 'move') {
        setDropTrackId(getDropTrackId(event));
      } else {
        setDropTrackId(null);
      }
    },
    [
      blocks,
      segments,
      durationInFrames,
      getDropTrackId,
      getPointerFrame,
      getSnapCandidates,
      onInteractionStart,
      onMoveBlock,
      onResizeBlock,
    ],
  );

  const endBlockInteraction = useCallback(
    (event: React.PointerEvent) => {
      const interaction = interactionRef.current;

      if (!interaction) {
        return;
      }

      handledPointerEventsRef.current.add(
        (event as React.PointerEvent).nativeEvent ?? (event as unknown as Event),
      );

      const wasDragging = interaction.dragging;

      if (wasDragging && event.type === 'pointerup') {
        suppressNextBlockClickRef.current = true;
        window.setTimeout(() => {
          suppressNextBlockClickRef.current = false;
        }, 0);
      }

      const cancelled = event.type === 'pointercancel';

      if (wasDragging && cancelled) {
        /*
         * Pointer cancellation must never commit a partial drag.
         * Restore the exact pre-interaction timing before closing
         * the transaction. Because the transaction then ends with
         * the same snapshot it started from, history gets no entry.
         */
        restoreCancelledBlockInteraction(interaction, {
          onMoveBlock,
          onResizeBlock,
        });
      }

      if (wasDragging && !cancelled && interaction.type === 'move') {
        // The block can temporarily disappear from `blocks` during a
        // cross-scene transfer because its scene-qualified React key changes.
        // Use the interaction snapshot as a fallback so dropping onto another
        // track is committed on the first attempt, not only after React has
        // completed the next render.
        const block = resolveInteractingBlock(blocks, interaction.editorId, interaction.lastBlock);

        if (block) {
          const dropLayer = getDropTrackId(event);

          if (dropLayer && dropLayer !== getTrackId(block)) {
            onChangeBlockLayer(interaction.editorId, dropLayer);
          }
        }
      }

      setDropTrackId(null);
      setDropSceneId(null);

      interactionRef.current = null;
      dragAxisRef.current = null;

      setDraggingId(null);

      try {
        const target = event.currentTarget as HTMLElement;

        if (target.hasPointerCapture(event.pointerId)) {
          target.releasePointerCapture(event.pointerId);
        }
      } catch {
        // Ignore.
      }

      if (wasDragging) {
        onInteractionEnd?.();
      }
    },
    [blocks, getDropTrackId, onChangeBlockLayer, onInteractionEnd, onMoveBlock, onResizeBlock],
  );

  // The clip's scene-qualified React key changes when it is transferred to a
  // different scene. That can destroy pointer capture on the old DOM node. Keep
  // a window-level fallback so the same drag continues until the mouse is up.
  useTimelineWindowPointerFallback(
    interactionRef,
    handledPointerEventsRef,
    updateBlockInteraction,
    endBlockInteraction,
  );

  return {
    draggingId,
    dropTrackId,
    dropSceneId,
    beginBlockInteraction,
    updateBlockInteraction,
    endBlockInteraction,
    suppressNextBlockClickRef,
  };
}
