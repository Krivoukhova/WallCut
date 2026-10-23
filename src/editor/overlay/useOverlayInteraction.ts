import { useEffect, useRef, useState } from 'react';
import type React from 'react';

import type {
  EditorBlock,
  DragState,
  OverlayInteractionHandlers,
  ResizeHandle,
} from './overlayTypes';
import {
  getCompositionPointer,
  getPointerDelta,
  getScaleX,
  getScaleY,
  localToWorld,
  normalizeRotation,
  worldToLocal,
  COMPOSITION_WIDTH,
  COMPOSITION_HEIGHT,
} from './overlayGeometry';

function getPlayer(element: HTMLElement): HTMLElement | null {
  return element.closest('[data-editor-player]') as HTMLElement | null;
}

function createBaseDrag(block: EditorBlock, id: string, event: React.PointerEvent): DragState {
  const scaleX = getScaleX(block);
  const scaleY = getScaleY(block);
  return {
    id,
    mode: 'move',
    startMouseX: event.clientX,
    startMouseY: event.clientY,
    startX: block.x,
    startY: block.y,
    startScale: block.scale,
    startScaleX: scaleX,
    startScaleY: scaleY,
    startRotation: block.rotation,
    startWidth: block.width,
    startHeight: block.height,
    startEffectiveWidth: block.width * block.scale * scaleX,
    startEffectiveHeight: block.height * block.scale * scaleY,
    startLocalX: 0,
    startLocalY: 0,
    blockType: block.block.type,
  };
}

export function useOverlayInteraction({
  onMove,
  onResize,
  onRotate,
  onInteractionStart,
  onInteractionEnd,
  selectedIds = [],
  blocks = [],
  onResizeSelection,
  onRotateSelection,
}: OverlayInteractionHandlers & { selectedIds?: string[]; blocks?: EditorBlock[] }) {
  const dragRef = useRef<DragState | null>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);

  const getMoveSnapDelta = (drag: DragState, rawX: number, rawY: number) => {
    const groupStartCenterX = drag.groupStartCenterX ?? drag.startX;
    const groupStartCenterY = drag.groupStartCenterY ?? drag.startY;
    const rawGroupCenterX = groupStartCenterX + (rawX - drag.startX);
    const rawGroupCenterY = groupStartCenterY + (rawY - drag.startY);
    const threshold = 36;

    return {
      x:
        Math.abs(rawGroupCenterX - COMPOSITION_WIDTH / 2) <= threshold
          ? COMPOSITION_WIDTH / 2 - rawGroupCenterX
          : 0,
      y:
        Math.abs(rawGroupCenterY - COMPOSITION_HEIGHT / 2) <= threshold
          ? COMPOSITION_HEIGHT / 2 - rawGroupCenterY
          : 0,
    };
  };

  const begin = (event: React.PointerEvent, block: EditorBlock, state: DragState) => {
    const player = getPlayer(event.currentTarget as HTMLElement);
    if (!player) return;

    onInteractionStart();
    dragRef.current = state;
    setDraggingId(state.id);
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  };

  const startMove = (event: React.PointerEvent, block: EditorBlock) => {
    const id = block.editorId ?? block.id;
    const state = createBaseDrag(block, id, event);
    state.selectionIds = selectedIds.includes(id) ? [...selectedIds] : [id];
    const ids = state.selectionIds;
    const selected = blocks.filter((b) => ids.includes(b.editorId ?? b.id));
    if (selected.length) {
      const bounds = selected.reduce(
        (acc, item) => {
          const width = Math.max(1, (item.width ?? 0) * (item.scale ?? 1) * (item.scaleX ?? 1));
          const height = Math.max(1, (item.height ?? 0) * (item.scale ?? 1) * (item.scaleY ?? 1));
          return {
            left: Math.min(acc.left, item.x - width / 2),
            right: Math.max(acc.right, item.x + width / 2),
            top: Math.min(acc.top, item.y - height / 2),
            bottom: Math.max(acc.bottom, item.y + height / 2),
          };
        },
        { left: Infinity, right: -Infinity, top: Infinity, bottom: -Infinity },
      );
      state.groupStartCenterX = (bounds.left + bounds.right) / 2;
      state.groupStartCenterY = (bounds.top + bounds.bottom) / 2;
    }
    begin(event, block, state);
  };

  const startResize = (event: React.PointerEvent, block: EditorBlock, handle: ResizeHandle) => {
    const player = getPlayer(event.currentTarget as HTMLElement);
    if (!player) return;

    const id = block.editorId ?? block.id;
    const pointer = getCompositionPointer(event.nativeEvent, player);
    const local = worldToLocal(pointer.x, pointer.y, block.x, block.y, block.rotation);
    const state = createBaseDrag(block, id, event);
    state.mode = 'resize';
    state.handle = handle;
    state.startLocalX = local.x;
    state.startLocalY = local.y;

    const ids = selectedIds.includes(id) ? selectedIds : [id];
    const selected = blocks.filter((item) => {
      const itemId = item.editorId ?? item.id;
      return ids.includes(itemId) && !itemId.includes('/');
    });
    if (selected.length > 1) {
      state.selectionTransformIds = selected.map((item) => item.editorId ?? item.id);
      state.selectionStart = selected.map((item) => ({
        id: item.editorId ?? item.id,
        x: item.x,
        y: item.y,
        rotation: item.rotation ?? 0,
        scaleX: item.scaleX ?? 1,
        scaleY: item.scaleY ?? 1,
        width: item.width,
        height: item.height,
      }));
      state.selectionBounds = selected.reduce(
        (acc, item) => {
          const width = Math.max(1, item.width * item.scale * (item.scaleX ?? 1));
          const height = Math.max(1, item.height * item.scale * (item.scaleY ?? 1));
          return {
            left: Math.min(acc.left, item.x - width / 2),
            right: Math.max(acc.right, item.x + width / 2),
            top: Math.min(acc.top, item.y - height / 2),
            bottom: Math.max(acc.bottom, item.y + height / 2),
          };
        },
        { left: Infinity, right: -Infinity, top: Infinity, bottom: -Infinity },
      );
    }
    begin(event, block, state);
  };

  const startRotate = (event: React.PointerEvent, block: EditorBlock) => {
    const player = getPlayer(event.currentTarget as HTMLElement);
    if (!player) return;

    const id = block.editorId ?? block.id;
    const pointer = getCompositionPointer(event.nativeEvent, player);
    const angle = Math.atan2(pointer.y - block.y, pointer.x - block.x) * (180 / Math.PI);
    const state = createBaseDrag(block, id, event);
    state.mode = 'rotate';
    state.startAngle = angle;

    const ids = selectedIds.includes(id) ? selectedIds : [id];
    const selected = blocks.filter((item) => {
      const itemId = item.editorId ?? item.id;
      return ids.includes(itemId) && !itemId.includes('/');
    });
    if (selected.length > 1) {
      state.selectionTransformIds = selected.map((item) => item.editorId ?? item.id);
      state.selectionStart = selected.map((item) => ({
        id: item.editorId ?? item.id,
        x: item.x,
        y: item.y,
        rotation: item.rotation ?? 0,
        scaleX: item.scaleX ?? 1,
        scaleY: item.scaleY ?? 1,
        width: item.width,
        height: item.height,
      }));
      state.selectionBounds = selected.reduce(
        (acc, item) => {
          const width = Math.max(1, item.width * item.scale * (item.scaleX ?? 1));
          const height = Math.max(1, item.height * item.scale * (item.scaleY ?? 1));
          return {
            left: Math.min(acc.left, item.x - width / 2),
            right: Math.max(acc.right, item.x + width / 2),
            top: Math.min(acc.top, item.y - height / 2),
            bottom: Math.max(acc.bottom, item.y + height / 2),
          };
        },
        { left: Infinity, right: -Infinity, top: Infinity, bottom: -Infinity },
      );
    }
    begin(event, block, state);
  };

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const drag = dragRef.current;
      if (!drag) return;

      const element = document.querySelector('[data-editor-player]') as HTMLElement | null;
      if (!element) return;

      const delta = getPointerDelta(event, drag.startMouseX, drag.startMouseY, element);

      if (drag.mode === 'move') {
        const rawX = drag.startX + delta.x;
        const rawY = drag.startY + delta.y;
        const snap = getMoveSnapDelta(drag, rawX, rawY);
        const nextX = rawX + snap.x;
        const nextY = rawY + snap.y;
        const nextId = onMove(drag.id, nextX, nextY, drag.selectionIds);

        if (typeof nextId === 'string' && nextId !== drag.id) {
          // Reparenting changes the block's editor ID and coordinate space,
          // but must not reset the pointer origin or drag origin. Keeping the
          // original drag anchors prevents the block from snapping to the
          // Group edge when it crosses the membership threshold.
          drag.id = nextId;
          setDraggingId(nextId);
        }
        return;
      }

      if (drag.mode === 'rotate') {
        const pointer = getCompositionPointer(event, element);
        const angle =
          Math.atan2(pointer.y - drag.startY, pointer.x - drag.startX) * (180 / Math.PI);
        const deltaRotation = angle - (drag.startAngle ?? 0);
        if (drag.selectionStart?.length && drag.selectionBounds && onRotateSelection) {
          const centerX = (drag.selectionBounds.left + drag.selectionBounds.right) / 2;
          const centerY = (drag.selectionBounds.top + drag.selectionBounds.bottom) / 2;
          const radians = (deltaRotation * Math.PI) / 180;
          const cos = Math.cos(radians);
          const sin = Math.sin(radians);
          onRotateSelection(
            drag.selectionStart.map((item) => {
              const dx = item.x - centerX;
              const dy = item.y - centerY;
              return {
                id: item.id,
                x: centerX + dx * cos - dy * sin,
                y: centerY + dx * sin + dy * cos,
                rotation: normalizeRotation(item.rotation + deltaRotation),
              };
            }),
          );
        } else {
          onRotate(drag.id, normalizeRotation(drag.startRotation + deltaRotation));
        }
        return;
      }

      if (drag.mode !== 'resize' || !drag.handle) return;

      const pointer = getCompositionPointer(event, element);
      const local = worldToLocal(
        pointer.x,
        pointer.y,
        drag.startX,
        drag.startY,
        drag.startRotation,
      );
      const handle = drag.handle;
      const isLine = drag.blockType === 'line';
      const isCircle = drag.blockType === 'circle';
      const isText = drag.blockType === 'text';
      const affectsX = handle.includes('e') || handle.includes('w');
      const affectsY = !isLine && (handle.includes('n') || handle.includes('s'));

      let anchorX = 0;
      let anchorY = 0;
      if (handle.includes('e')) anchorX = -drag.startEffectiveWidth / 2;
      else if (handle.includes('w')) anchorX = drag.startEffectiveWidth / 2;
      if (handle.includes('s')) anchorY = -drag.startEffectiveHeight / 2;
      else if (handle.includes('n')) anchorY = drag.startEffectiveHeight / 2;

      let newWidth = drag.startEffectiveWidth;
      let newHeight = drag.startEffectiveHeight;
      if (affectsX) newWidth = handle.includes('e') ? local.x - anchorX : anchorX - local.x;
      if (affectsY) newHeight = handle.includes('s') ? local.y - anchorY : anchorY - local.y;
      newWidth = Math.max(20, newWidth);
      newHeight = Math.max(20, newHeight);

      // Lines should stretch horizontally without exploding in size because their
      // height is only a few pixels. Ignore vertical resize for line handles.
      if (isLine) {
        newHeight = drag.startEffectiveHeight;
      }

      // Circles must remain circles even when a side handle is used.
      if (isCircle) {
        const size =
          affectsX && affectsY ? Math.max(newWidth, newHeight) : affectsX ? newWidth : newHeight;
        newWidth = Math.max(20, size);
        newHeight = Math.max(20, size);
      }

      if (!isLine && !isCircle && !isText && affectsX && affectsY) {
        const ratio = Math.max(
          newWidth / drag.startEffectiveWidth,
          newHeight / drag.startEffectiveHeight,
        );
        newWidth = drag.startEffectiveWidth * ratio;
        newHeight = drag.startEffectiveHeight * ratio;
      }

      if (drag.selectionStart?.length && drag.selectionBounds && onResizeSelection) {
        const bounds = drag.selectionBounds;
        const startWidth = Math.max(1, bounds.right - bounds.left);
        const startHeight = Math.max(1, bounds.bottom - bounds.top);
        const dx = local.x - drag.startLocalX;
        const dy = local.y - drag.startLocalY;
        let nextWidth = startWidth;
        let nextHeight = startHeight;
        if (handle.includes('e')) nextWidth = startWidth + dx;
        if (handle.includes('w')) nextWidth = startWidth - dx;
        if (handle.includes('s')) nextHeight = startHeight + dy;
        if (handle.includes('n')) nextHeight = startHeight - dy;
        nextWidth = Math.max(20, nextWidth);
        nextHeight = Math.max(20, nextHeight);
        if (!isLine && !isCircle && affectsX && affectsY) {
          const ratio = Math.max(nextWidth / startWidth, nextHeight / startHeight);
          nextWidth = startWidth * ratio;
          nextHeight = startHeight * ratio;
        }
        const sx = affectsX ? nextWidth / startWidth : 1;
        const sy = affectsY ? nextHeight / startHeight : 1;
        const newLeft = handle.includes('w') ? bounds.right - nextWidth : bounds.left;
        const newTop = handle.includes('n') ? bounds.bottom - nextHeight : bounds.top;
        const oldCenterX = (bounds.left + bounds.right) / 2;
        const oldCenterY = (bounds.top + bounds.bottom) / 2;
        const newCenterX = newLeft + nextWidth / 2;
        const newCenterY = newTop + nextHeight / 2;
        onResizeSelection(
          drag.selectionStart.map((item) => ({
            id: item.id,
            x: newCenterX + (item.x - oldCenterX) * sx,
            y: newCenterY + (item.y - oldCenterY) * sy,
            scaleX: Math.max(0.05, Math.min(20, item.scaleX * sx)),
            scaleY: Math.max(0.05, Math.min(20, item.scaleY * sy)),
          })),
        );
        return;
      }

      let centerLocalX = 0;
      let centerLocalY = 0;
      if (affectsX) {
        const direction = handle.includes('e') ? 1 : -1;
        centerLocalX = anchorX + (newWidth / 2) * direction;
      }
      if (affectsY) {
        const direction = handle.includes('s') ? 1 : -1;
        centerLocalY = anchorY + (newHeight / 2) * direction;
      }

      const newCenter = localToWorld(
        centerLocalX,
        centerLocalY,
        drag.startX,
        drag.startY,
        drag.startRotation,
      );

      // scaleX/scaleY are absolute persisted transforms, not multipliers to
      // apply on top of their previous values. Divide the desired effective
      // size by the un-axis-scaled dimensions; including startScaleX/Y here
      // would reset a previously resized object toward 1 on the next drag.
      const baseWidth = drag.startWidth * drag.startScale;
      const baseHeight = drag.startHeight * drag.startScale;
      const scaleX = Math.max(0.05, Math.min(20, newWidth / baseWidth));
      const scaleY = Math.max(0.05, Math.min(20, newHeight / baseHeight));

      onMove(drag.id, newCenter.x, newCenter.y);
      onResize(drag.id, scaleX, scaleY);
    };

    const finishInteraction = () => {
      if (dragRef.current) onInteractionEnd();
      dragRef.current = null;
      setDraggingId(null);
    };

    // Capture phase makes cleanup reliable even if the overlay DOM node is
    // replaced while a group/child changes its editorId during a drag.
    // pointercancel, native dragend, and window blur must also never leave a
    // stale drag active (which makes the object follow the cursor after release).
    const handlePointerUp = () => finishInteraction();
    const handlePointerCancel = () => finishInteraction();
    const handleDragEnd = () => finishInteraction();
    const handleBlur = () => finishInteraction();

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp, true);
    window.addEventListener('pointercancel', handlePointerCancel, true);
    window.addEventListener('dragend', handleDragEnd, true);
    window.addEventListener('blur', handleBlur);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp, true);
      window.removeEventListener('pointercancel', handlePointerCancel, true);
      window.removeEventListener('dragend', handleDragEnd, true);
      window.removeEventListener('blur', handleBlur);
    };
  }, [
    onMove,
    onResize,
    onRotate,
    onResizeSelection,
    onRotateSelection,
    onInteractionStart,
    onInteractionEnd,
  ]);

  return { draggingId, startMove, startResize, startRotate };
}
