import { useCallback } from 'react';
import type { MutableRefObject } from 'react';

import type { VisualBlockData } from '../../domain/blocks/blockTypes';
import type { VisualTimelineData } from '../../domain/timeline/visualTimelineTypes';
import { findRawBlock, parseEditorId } from '../commands/blockCommands';
import { getBlockMetrics } from '../../domain/layout/metrics';

export function useEditorOverlayActions(options: {
  timelineRef: MutableRefObject<VisualTimelineData>;
  commitTimelineChange: (updater: (timeline: VisualTimelineData) => VisualTimelineData) => void;
  setSelectedBlockId: (id: string | null) => void;
  selectedBlockIds?: string[];
  updateBlock: (editorId: string, updater: (block: VisualBlockData) => VisualBlockData) => void;
}) {
  const {
    timelineRef,
    commitTimelineChange,
    updateBlock,
    setSelectedBlockId,
    selectedBlockIds = [],
  } = options;

  const moveBlockIntoGroupIfNeeded = useCallback(
    (editorId: string, worldX: number, worldY: number) => {
      const parsed = parseEditorId(editorId);

      /*
       * Only top-level blocks can be
       * reparented into a Group.
       */
      if (!parsed || parsed.blockId.includes('/')) {
        return null;
      }

      const segment = timelineRef.current.segments.find((item) => item.id === parsed.segmentId);

      if (!segment) {
        return null;
      }

      const sourceIndex = segment.blocks.findIndex(
        (block, index) => (block.id ?? `${block.type}-${index}`) === parsed.blockId,
      );

      if (sourceIndex < 0) {
        return null;
      }

      const source = segment.blocks[sourceIndex];

      /*
       * Containers cannot be placed inside
       * another Group through this operation.
       */
      if (['group', 'stack', 'sequence', 'overlay'].includes(source.type)) {
        return null;
      }

      /*
       * Find Group under the current pointer.
       */
      const target = segment.blocks.find((candidate, index) => {
        const candidateId = candidate.id ?? `${candidate.type}-${index}`;

        if (candidateId === parsed.blockId) {
          return false;
        }

        if (candidate.type !== 'group') {
          return false;
        }

        const metrics = getBlockMetrics(candidate);

        const width = Math.max(
          1,
          (candidate.width ?? metrics.width) * (candidate.scale ?? 1) * (candidate.scaleX ?? 1),
        );

        const height = Math.max(
          1,
          (candidate.height ?? metrics.height) * (candidate.scale ?? 1) * (candidate.scaleY ?? 1),
        );

        const gx = candidate.x ?? 540;

        const gy = candidate.y ?? 960;

        /*
         * Group membership is based on the dragged block
         * intersecting the Group, not only on the block
         * center being inside it. This makes dropping natural:
         * if any meaningful part of the object is over the
         * Group, it can be nested there.
         *
         * Work in the Group's local coordinate system so Group
         * rotation is handled correctly. The dragged block is
         * represented by its four world-space corners, then
         * those corners are transformed into Group-local space.
         */
        const sourceWidth = Math.max(
          1,
          (source.width ?? getBlockMetrics(source).width) *
            (source.scale ?? 1) *
            (source.scaleX ?? 1),
        );
        const sourceHeight = Math.max(
          1,
          (source.height ?? getBlockMetrics(source).height) *
            (source.scale ?? 1) *
            (source.scaleY ?? 1),
        );
        const sourceRotation = ((source.rotation ?? 0) * Math.PI) / 180;
        const groupRotation = ((candidate.rotation ?? 0) * Math.PI) / 180;

        const sourceCos = Math.cos(sourceRotation);
        const sourceSin = Math.sin(sourceRotation);
        const groupCos = Math.cos(-groupRotation);
        const groupSin = Math.sin(-groupRotation);
        const halfWidth = sourceWidth / 2;
        const halfHeight = sourceHeight / 2;

        const corners = [
          [-halfWidth, -halfHeight],
          [halfWidth, -halfHeight],
          [halfWidth, halfHeight],
          [-halfWidth, halfHeight],
        ].map(([localX, localY]) => {
          const rotatedX = localX * sourceCos - localY * sourceSin;
          const rotatedY = localX * sourceSin + localY * sourceCos;
          const worldCornerX = worldX + rotatedX;
          const worldCornerY = worldY + rotatedY;
          const dx = worldCornerX - gx;
          const dy = worldCornerY - gy;

          return {
            x: dx * groupCos - dy * groupSin,
            y: dx * groupSin + dy * groupCos,
          };
        });

        const groupHalfWidth = width / 2;
        const groupHalfHeight = height / 2;

        // Use the same transition threshold in both directions:
        // a child leaves when its center crosses the Group boundary,
        // so a top-level block must not re-enter merely because its
        // edge overlaps the Group. Otherwise it is nested at the edge,
        // immediately considered outside on the next pointermove, and
        // oscillates at the boundary while the mouse is still held.
        const centerX = (corners[0].x + corners[2].x) / 2;
        const centerY = (corners[0].y + corners[2].y) / 2;

        return Math.abs(centerX) <= groupHalfWidth && Math.abs(centerY) <= groupHalfHeight;
      });

      if (!target) {
        return null;
      }

      const targetId = target.id ?? `${target.type}-${segment.blocks.indexOf(target)}`;

      const sourceId = source.id ?? parsed.blockId;

      const groupX = target.x ?? 540;

      const groupY = target.y ?? 960;

      const groupRotation = target.rotation ?? 0;

      const existingChildren = target.children ?? [];

      /*
       * Convert the world position of the
       * dragged block into Group-local
       * coordinates.
       *
       * IMPORTANT:
       *
       * Child coordinates are NOT divided
       * by Group scale here.
       *
       * GroupBlock compensates the visual
       * scale when rendering its children.
       */
      const dx = worldX - groupX;

      const dy = worldY - groupY;

      const radians = (-groupRotation * Math.PI) / 180;

      const cos = Math.cos(radians);

      const sin = Math.sin(radians);

      const rotatedX = dx * cos - dy * sin;

      const rotatedY = dx * sin + dy * cos;

      /*
       * Never create duplicate children
       * if the pointer callback fires twice.
       */
      if (existingChildren.some((child) => child.id === sourceId)) {
        return `${parsed.segmentId}:${targetId}/${sourceId}`;
      }

      const child = {
        ...source,

        id: sourceId,

        x: rotatedX,
        y: rotatedY,
        rotation: (source.rotation ?? 0) - groupRotation,

        zIndex: existingChildren.length,
      };

      commitTimelineChange((timeline) => ({
        ...timeline,

        segments: timeline.segments.map((item) => {
          if (item.id !== parsed.segmentId) {
            return item;
          }

          return {
            ...item,

            /*
             * Remove the source from
             * the top-level list.
             */
            blocks: item.blocks
              .filter((_, index) => index !== sourceIndex)
              .map((block, index) => {
                const id = block.id ?? `${block.type}-${index}`;

                if (id !== targetId) {
                  return block;
                }

                return {
                  ...block,

                  children: [
                    ...(block.children ?? []).filter((existing) => existing.id !== sourceId),

                    child,
                  ],
                };
              }),
          };
        }),
      }));

      const childEditorId = `${parsed.segmentId}:${targetId}/${sourceId}`;

      /*
       * The nesting drag itself continues to use the child ID,
       * but once the pointer is released the Group must be the
       * selected overlay. Otherwise the newly nested child stays
       * above the Group and captures the next pointerdown, which
       * makes the first attempt to drag the Group look like a
       * second/ghost drag.
       */
      const groupEditorId = `${parsed.segmentId}:${targetId}`;

      setSelectedBlockId(groupEditorId);

      return childEditorId;
    },
    [timelineRef, commitTimelineChange, setSelectedBlockId],
  );

  const handleMove = useCallback(
    (editorId: string, x: number, y: number, dragSelectionIds?: string[]) => {
      const parsed = parseEditorId(editorId);

      const local = parsed?.blockId.split('/').filter(Boolean) ?? [];

      const activeSelectionIds = dragSelectionIds?.length ? dragSelectionIds : selectedBlockIds;
      if (activeSelectionIds.length > 1 && parsed && !parsed.blockId.includes('/')) {
        const primary = findRawBlock(timelineRef.current, editorId);
        if (primary) {
          // Canvas-center snapping is already applied in the pointer-drag layer.
          // Do not snap a second time here: doing so applies the delta twice and
          // makes some objects appear to stop short of the guide.
          const baseX = primary.block.x ?? 540;
          const baseY = primary.block.y ?? 960;
          const dx = x - baseX;
          const dy = y - baseY;
          commitTimelineChange((timeline) => ({
            ...timeline,
            segments: timeline.segments.map((segment) => ({
              ...segment,
              blocks: segment.blocks.map((block, index) => {
                const id = `${segment.id}:${block.id ?? `${block.type}-${index}`}`;
                if (!activeSelectionIds.includes(id)) return block;
                return { ...block, x: (block.x ?? 540) + dx, y: (block.y ?? 960) + dy };
              }),
            })),
          }));
          return;
        }
      }

      if (local.length > 1 && parsed) {
        const parentPath = [parsed.segmentId, local.slice(0, -1).join('/')].join(':');

        const parent = findRawBlock(timelineRef.current, parentPath);

        if (parent) {
          // A direct child of a Group can be pulled out by
          // dragging it completely outside the Group bounds.
          // Convert the world pointer to the Group's local
          // coordinates first so rotation is respected.
          if (parent.block.type === 'group') {
            const groupWidth = Math.max(
              1,
              parent.block.width ?? getBlockMetrics(parent.block).width,
            );
            const groupHeight = Math.max(
              1,
              parent.block.height ?? getBlockMetrics(parent.block).height,
            );
            const groupX = parent.block.x ?? 540;
            const groupY = parent.block.y ?? 960;
            const groupRotation = parent.block.rotation ?? 0;
            const dx = x - groupX;
            const dy = y - groupY;
            const radians = (-groupRotation * Math.PI) / 180;
            const cos = Math.cos(radians);
            const sin = Math.sin(radians);
            const localPointerX = dx * cos - dy * sin;
            const localPointerY = dx * sin + dy * cos;
            const outside =
              Math.abs(localPointerX) > groupWidth / 2 || Math.abs(localPointerY) > groupHeight / 2;

            if (outside) {
              const childId = local[local.length - 1];
              const child = findRawBlock(timelineRef.current, editorId);

              if (child) {
                const independentId = child.block.id ?? childId;
                const independentBlock = {
                  ...child.block,
                  id: independentId,
                  x,
                  y,
                  rotation: (child.block.rotation ?? 0) + groupRotation,
                };

                commitTimelineChange((timeline) => ({
                  ...timeline,
                  segments: timeline.segments.map((segment) => {
                    if (segment.id !== parsed.segmentId) return segment;
                    const parentId = parent.block.id ?? local[local.length - 2];
                    const nextBlocks = segment.blocks.map((block) => {
                      const blockId = block.id ?? block.type;
                      if (blockId !== parentId) return block;
                      return {
                        ...block,
                        children: (block.children ?? []).filter(
                          (nested) => (nested.id ?? nested.type) !== childId,
                        ),
                      };
                    });
                    return {
                      ...segment,
                      blocks: [...nextBlocks, independentBlock],
                    };
                  }),
                }));

                return `${parsed.segmentId}:${independentId}`;
              }
            }
          }
          const parentX = parent.block.x ?? 540;

          const parentY = parent.block.y ?? 960;

          const parentRotation = parent.block.rotation ?? 0;

          const dx = x - parentX;

          const dy = y - parentY;

          /*
           * World -> parent local:
           * inverse rotation.
           */
          const radians = (-parentRotation * Math.PI) / 180;

          const cos = Math.cos(radians);

          const sin = Math.sin(radians);

          const localX = dx * cos - dy * sin;

          const localY = dx * sin + dy * cos;

          updateBlock(editorId, (block) => ({
            ...block,
            x: localX,
            y: localY,
          }));

          return;
        }
      }

      const moved = findRawBlock(timelineRef.current, editorId);

      if (
        moved?.block.type === 'group' ||
        moved?.block.type === 'stack' ||
        moved?.block.type === 'sequence' ||
        moved?.block.type === 'overlay'
      ) {
        updateBlock(editorId, (block) => ({
          ...block,
          x,
          y,
        }));

        return;
      }

      const newEditorId = moveBlockIntoGroupIfNeeded(editorId, x, y);

      if (newEditorId) {
        /*
         * The caller owns selection state.
         * The returned ID allows the drag system
         * to continue using the new nested path.
         */
        return newEditorId;
      }

      updateBlock(editorId, (block) => ({
        ...block,
        x,
        y,
      }));
    },
    [updateBlock, commitTimelineChange, timelineRef, moveBlockIntoGroupIfNeeded, selectedBlockIds],
  );

  const handleResize = useCallback(
    (editorId: string, scaleX: number, scaleY: number) => {
      updateBlock(editorId, (block) => {
        // Keep resize values absolute relative to the drag start, just as
        // for other block types. The text renderer applies scaleX/scaleY to
        // its layout box (not to glyphs). Mutating width/height here would
        // multiply an already-resized dimension on every pointer move,
        // causing the text box to drift and its handles to run away.
        return {
          ...block,
          scaleX,
          scaleY,
        };
      });
    },
    [updateBlock],
  );

  const handleRotate = useCallback(
    (editorId: string, rotation: number) => {
      updateBlock(editorId, (block) => ({
        ...block,
        rotation,
      }));
    },
    [updateBlock],
  );

  const handleResizeSelection = useCallback(
    (updates: Array<{ id: string; scaleX: number; scaleY: number; x: number; y: number }>) => {
      if (!updates.length) return;
      const ids = new Set(updates.map((item) => item.id));
      commitTimelineChange((timeline) => ({
        ...timeline,
        segments: timeline.segments.map((segment) => ({
          ...segment,
          blocks: segment.blocks.map((block) => {
            const editorId = `${segment.id}:${block.id ?? block.type}`;
            const update = updates.find((item) => item.id === editorId);
            if (!update || !ids.has(editorId)) return block;
            return {
              ...block,
              x: update.x,
              y: update.y,
              scaleX: update.scaleX,
              scaleY: update.scaleY,
            };
          }),
        })),
      }));
    },
    [commitTimelineChange],
  );

  const handleRotateSelection = useCallback(
    (updates: Array<{ id: string; rotation: number; x: number; y: number }>) => {
      if (!updates.length) return;
      commitTimelineChange((timeline) => ({
        ...timeline,
        segments: timeline.segments.map((segment) => ({
          ...segment,
          blocks: segment.blocks.map((block) => {
            const editorId = `${segment.id}:${block.id ?? block.type}`;
            const update = updates.find((item) => item.id === editorId);
            if (!update) return block;
            return { ...block, x: update.x, y: update.y, rotation: update.rotation };
          }),
        })),
      }));
    },
    [commitTimelineChange],
  );

  return {
    handleMove,
    handleResize,
    handleRotate,
    handleResizeSelection,
    handleRotateSelection,
  };
}
