import { useCallback } from 'react';

import type { VisualBlockData } from '../../domain/blocks/blockTypes';
import type { TTSTimeline } from '../../domain/timeline/ttsTimelineTypes';
import type { VisualTimelineData } from '../../domain/timeline/visualTimelineTypes';
import type { ResolvedEditorBlock } from '../editorTypes';
import type { EditorHistory } from '../editorHistory';
import { findSceneQualifiedBlockLocation } from '../timeline/timelineBlockMove';

type UseEditorTimelineBlocksProps = {
  resolvedBlocks: ResolvedEditorBlock[];
  runtimeTimeline: TTSTimeline;
  editorVisualTimeline: VisualTimelineData;
  updateBlock: (editorId: string, updater: (block: VisualBlockData) => VisualBlockData) => void;
  commitTimelineChange: EditorHistory['commitTimelineChange'];
  setSelectedBlockId: (id: string | null) => void;
};

/** Timeline-specific block operations separated from the main editor hook. */
export const useEditorTimelineBlocks = ({
  resolvedBlocks,
  runtimeTimeline,
  editorVisualTimeline,
  updateBlock,
  commitTimelineChange,
  setSelectedBlockId,
}: UseEditorTimelineBlocksProps) => {

  const handleTimelineBlockMove = useCallback(
    (editorId: string, absoluteStartFrame: number) => {
      // The scene-qualified editor ID is required here. Falling back to a
      // local ID can select a different clip with the same ID in another scene.
      const block = resolvedBlocks.find((item) => item.editorId === editorId);

      if (!block) return;

      const activeEditorId = block.editorId;
      const sourceSegment = runtimeTimeline.segments.find((item) => item.id === block.segmentId);
      if (!sourceSegment) return;

      const targetFrame = Math.max(
        0,
        Math.min(Math.round(absoluteStartFrame), runtimeTimeline.totalFrames),
      );
      const targetSegment =
        runtimeTimeline.segments.find((item, index, all) => {
          const end = item.startFrame + item.durationFrames;
          return targetFrame >= item.startFrame && (targetFrame < end || index === all.length - 1);
        }) ?? sourceSegment;

      // Transfer when the clip's start enters another scene. This keeps the
      // absolute position continuous: midpoint-based transfer could happen
      // while the start was still before the scene, forcing local startFrame
      // to zero and visibly jumping the clip to the scene boundary.
      // Nested group children remain within their parent scene.
      const parsedId = String(
        block.block.id ?? activeEditorId.slice(activeEditorId.indexOf(':') + 1),
      );
      const isNestedBlock = parsedId.includes('/');
      if (targetSegment.id !== sourceSegment.id && !isNestedBlock) {
        const targetLocalStart = Math.max(0, targetFrame - targetSegment.startFrame);
        const targetDuration = Math.max(1, Math.min(block.duration, targetSegment.durationFrames));
        const nextStartFrame = Math.max(
          0,
          Math.min(targetLocalStart, targetSegment.durationFrames - targetDuration),
        );

        // IDs are only guaranteed to be unique inside a scene. If the target
        // scene already has this local ID, mint a new one before transferring;
        // otherwise React/editorId resolution can make two clips drag together.
        const targetRawSegment = editorVisualTimeline.segments.find(
          (item) => item.id === targetSegment.id,
        );
        const targetBlocks = targetRawSegment?.blocks ?? [];
        const targetIds = new Set(targetBlocks.map((raw) => String(raw.id ?? '')));
        let targetLocalId = parsedId;
        if (targetIds.has(targetLocalId)) {
          let suffix = 2;
          while (targetIds.has(`${parsedId}-moved-${suffix}`)) suffix += 1;
          targetLocalId = `${parsedId}-moved-${suffix}`;
        }

        // Find the closest free time slot in the destination scene for blocks
        // of the same type. Without this, a transfer near the scene's end can
        // clamp the clip backwards onto an existing clip and appear to fail.
        // Include destination blocks with the same local ID: they are distinct
        // clips in the destination scene and must still participate in collision checks.
        const sameTypeBlocks = targetBlocks.filter(
          (raw) => String(raw.type ?? '') === String(block.block.type ?? ''),
        );
        const collides = (start: number) =>
          sameTypeBlocks.some((raw) => {
            const otherStart = Math.max(0, Number(raw.startFrame ?? 0));
            const otherDuration = Math.max(1, Number(raw.duration ?? 1));
            return start < otherStart + otherDuration && start + targetDuration > otherStart;
          });
        let placedStart = nextStartFrame;
        if (collides(placedStart)) {
          const maxStart = Math.max(0, targetSegment.durationFrames - targetDuration);
          const candidates = new Set<number>([0, maxStart]);
          for (const raw of sameTypeBlocks) {
            const otherStart = Math.max(0, Number(raw.startFrame ?? 0));
            const otherDuration = Math.max(1, Number(raw.duration ?? 1));
            candidates.add(Math.max(0, Math.min(maxStart, otherStart - targetDuration)));
            candidates.add(Math.max(0, Math.min(maxStart, otherStart + otherDuration)));
          }
          const freeCandidates = [...candidates].filter((candidate) => !collides(candidate));
          if (freeCandidates.length > 0) {
            placedStart = freeCandidates.sort(
              (a, b) => Math.abs(a - nextStartFrame) - Math.abs(b - nextStartFrame),
            )[0];
          }
        }

        commitTimelineChange((previous) => {
          let moved: VisualBlockData | null = null;
          let removedFromSource = false;
          // IDs are only unique within a scene. Resolve the source by the
          // scene-qualified identity; never fall back to another scene's local ID.
          const sourceLocation = findSceneQualifiedBlockLocation(
            previous.segments,
            sourceSegment.id,
            parsedId,
          );
          if (!sourceLocation) return previous;
          const { segmentIndex: actualSourceIndex, blockIndex: sourceBlockIndex } = sourceLocation;

          const nextSegments = previous.segments.map((segment, segmentIndex) => {
            if (segmentIndex !== actualSourceIndex) return segment;
            const index = sourceBlockIndex;
            const sourceBlock = segment.blocks[index];
            moved = {
              ...sourceBlock,
              id: targetLocalId,
              startFrame: placedStart,
              duration: targetDuration,
            };
            const remainingBlocks = segment.blocks.slice();
            remainingBlocks.splice(index, 1);
            removedFromSource = true;
            return { ...segment, blocks: remainingBlocks };
          });
          if (!moved || !removedFromSource) return previous;
          // Destination scene identity must also match exactly; a positional
          // fallback could append the clip to a different scene if ordering changed.
          const targetIndex = nextSegments.findIndex((segment) => segment.id === targetSegment.id);
          if (targetIndex < 0) return previous;
          return {
            ...previous,
            segments: nextSegments.map((segment, index) =>
              index === targetIndex ? { ...segment, blocks: [...segment.blocks, moved!] } : segment,
            ),
          };
        });
        const nextEditorId = `${targetSegment.id}:${targetLocalId}`;
        setSelectedBlockId(nextEditorId);
        return nextEditorId;
      }

      const localStartFrame = targetFrame - sourceSegment.startFrame;
      const maxStartFrame = Math.max(0, sourceSegment.durationFrames - block.duration);
      const nextStartFrame = Math.max(0, Math.min(Math.round(localStartFrame), maxStartFrame));
      updateBlock(activeEditorId, (rawBlock) => ({ ...rawBlock, startFrame: nextStartFrame }));
    },
    [
      resolvedBlocks,
      runtimeTimeline,
      editorVisualTimeline,
      updateBlock,
      commitTimelineChange,
      setSelectedBlockId,
    ],
  );

  const handleTimelineBlockResize = useCallback(
    (editorId: string, absoluteStartFrame: number, duration: number) => {
      const block = resolvedBlocks.find((item) => item.editorId === editorId);

      if (!block) {
        return;
      }

      const segment = runtimeTimeline.segments.find((item) => item.id === block.segmentId);

      if (!segment) {
        return;
      }

      const localStartFrame = absoluteStartFrame - segment.startFrame;

      const maxStartFrame = Math.max(0, segment.durationFrames - 1);

      const nextStartFrame = Math.max(0, Math.min(Math.round(localStartFrame), maxStartFrame));

      const maxDuration = Math.max(1, segment.durationFrames - nextStartFrame);

      const nextDuration = Math.max(1, Math.min(Math.round(duration), maxDuration));

      updateBlock(editorId, (rawBlock) => ({
        ...rawBlock,
        startFrame: nextStartFrame,
        duration: nextDuration,
      }));
    },
    [resolvedBlocks, runtimeTimeline, updateBlock],
  );

  const handleTimelineBlockLayerChange = useCallback(
    (
      editorId: string,
      layer: 'background' | 'image' | 'character' | 'text' | 'shape' | 'other',
    ) => {
      updateBlock(editorId, (block) => ({
        ...block,
        layer,
      }));
    },
    [updateBlock],
  );

  return {
    handleTimelineBlockMove,
    handleTimelineBlockResize,
    handleTimelineBlockLayerChange,
  };
};
