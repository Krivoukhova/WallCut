import { useMemo } from 'react';

import { resolveBlocks } from '../../domain/resolution/blockResolver';
import type { VisualTimelineData } from '../../domain/timeline/visualTimelineTypes';
import type { ResolvedEditorBlock } from '../editorTypes';
import { buildEditorTimeline } from '../../domain/timeline/editorTimeline';

type RuntimeTimeline = ReturnType<typeof buildEditorTimeline>;

type UseResolvedEditorBlocksProps = {
  editorVisualTimeline: VisualTimelineData;
  runtimeTimeline: RuntimeTimeline;
};

export const useResolvedEditorBlocks = ({
  editorVisualTimeline,
  runtimeTimeline,
}: UseResolvedEditorBlocksProps): ResolvedEditorBlock[] => {
  return useMemo<ResolvedEditorBlock[]>(() => {
    const result: ResolvedEditorBlock[] = [];

    for (const visualSegment of editorVisualTimeline.segments) {
      const runtimeSegment = runtimeTimeline.segments.find(
        (segment) => segment.id === visualSegment.id,
      );

      if (!runtimeSegment) {
        continue;
      }

      const blocks = resolveBlocks(visualSegment.blocks, runtimeSegment.durationFrames);

      const pushResolved = (
        block: ResolvedEditorBlock,
        parentWorldX?: number,
        parentWorldY?: number,
        parentRotation = 0,
        parentPath?: string,
        parentStartFrame = 0,
      ) => {
        let worldX = block.x;

        let worldY = block.y;

        /*
         * Child block.
         *
         * Convert its local coordinates into
         * world coordinates using the accumulated
         * parent rotation.
         */
        if (parentWorldX !== undefined && parentWorldY !== undefined) {
          const radians = (parentRotation * Math.PI) / 180;

          const cos = Math.cos(radians);

          const sin = Math.sin(radians);

          const rotatedX = block.x * cos - block.y * sin;

          const rotatedY = block.x * sin + block.y * cos;

          worldX = parentWorldX + rotatedX;

          worldY = parentWorldY + rotatedY;
        }

        const path = parentPath ? `${parentPath}/${block.id}` : block.id;

        /*
         * The resolved block exposed to the
         * editor overlay must contain world
         * coordinates.
         */
        const resolved = {
          ...block,

          x: worldX,
          y: worldY,

          block: {
            ...block.block,
            x: worldX,
            y: worldY,
          },

          editorId: `${runtimeSegment.id}:${path}`,

          segmentId: runtimeSegment.id,

          segmentDuration: runtimeSegment.durationFrames,

          absoluteStartFrame: runtimeSegment.startFrame + parentStartFrame + block.startFrame,
        };

        result.push(resolved);

        if (block.block.type === 'group') {
          const children = block.block.children ?? [];

          /*
           * The Group's own rotation must be
           * added to the parent's accumulated
           * rotation for its children.
           */
          const nextRotation =
            parentWorldX === undefined ? block.rotation : parentRotation + block.rotation;

          children.forEach((child) => {
            const childResolved = resolveBlocks([child], runtimeSegment.durationFrames)[0];

            if (!childResolved) {
              return;
            }

            pushResolved(
              childResolved as ResolvedEditorBlock,
              worldX,
              worldY,
              nextRotation,
              path,
              parentStartFrame + block.startFrame,
            );
          });
        }
      };

      for (const block of blocks) {
        pushResolved({
          ...block,

          editorId: `${runtimeSegment.id}:${block.id}`,

          segmentId: runtimeSegment.id,

          segmentDuration: runtimeSegment.durationFrames,

          absoluteStartFrame: runtimeSegment.startFrame + block.startFrame,
        });
      }
    }

    return result;
  }, [editorVisualTimeline, runtimeTimeline]);
};
