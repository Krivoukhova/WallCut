import type { EditorBlock } from './overlayTypes';

export const COMPOSITION_WIDTH = 1080;
export const COMPOSITION_HEIGHT = 1920;

export function getScaleX(block: EditorBlock): number {
  return Number((block.block as typeof block.block & { scaleX?: number }).scaleX) || 1;
}

export function getScaleY(block: EditorBlock): number {
  return Number((block.block as typeof block.block & { scaleY?: number }).scaleY) || 1;
}

export function worldToLocal(
  worldX: number,
  worldY: number,
  centerX: number,
  centerY: number,
  rotation: number,
) {
  const dx = worldX - centerX;
  const dy = worldY - centerY;
  const radians = (-rotation * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);

  return { x: dx * cos - dy * sin, y: dx * sin + dy * cos };
}

export function localToWorld(
  localX: number,
  localY: number,
  centerX: number,
  centerY: number,
  rotation: number,
) {
  const radians = (rotation * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);

  return {
    x: centerX + localX * cos - localY * sin,
    y: centerY + localX * sin + localY * cos,
  };
}

export function getCompositionPointer(event: PointerEvent, player: HTMLElement) {
  const rect = player.getBoundingClientRect();
  return {
    x: ((event.clientX - rect.left) / rect.width) * COMPOSITION_WIDTH,
    y: ((event.clientY - rect.top) / rect.height) * COMPOSITION_HEIGHT,
  };
}

export function getPointerDelta(
  event: PointerEvent,
  startMouseX: number,
  startMouseY: number,
  player: HTMLElement,
) {
  const rect = player.getBoundingClientRect();
  return {
    x: ((event.clientX - startMouseX) / rect.width) * COMPOSITION_WIDTH,
    y: ((event.clientY - startMouseY) / rect.height) * COMPOSITION_HEIGHT,
  };
}

export function normalizeRotation(rotation: number): number {
  let value = rotation;
  while (value > 180) value -= 360;
  while (value < -180) value += 360;
  return value;
}
