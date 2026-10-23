import { isInsideCanvas, getOverlapArea, getRectDistance } from './layoutGeometry';
import type { LayoutRect } from './layoutGeometry';
import type { VisualPosition } from './layoutTypes';

/** Minimum preferred visual gap between placed blocks, in canvas units. */
const COLLISION_GAP = 80;

/**
 * Scores a candidate rectangle. Lower is better. Keep the existing weights
 * stable: they determine the automatic layout's established placement order.
 */
export function calculatePositionScore(
  rect: LayoutRect,
  placed: LayoutRect[],
  position: VisualPosition,
): number {
  if (!isInsideCanvas(rect)) return 100000000;

  let score = 0;
  for (const other of placed) {
    const overlap = getOverlapArea(rect, other);
    if (overlap > 0) score += 100000000 + overlap * 100;
  }

  for (const other of placed) {
    const distance = getRectDistance(rect, other);
    if (distance < COLLISION_GAP) {
      score += 100000 + (COLLISION_GAP - distance) * 100;
    }
  }

  return score + getPositionPenalty(position);
}

function getPositionPenalty(position: VisualPosition): number {
  switch (position) {
    case 'center':
      return 0;
    case 'top':
    case 'bottom':
      return 5;
    case 'centerLeft':
    case 'centerRight':
      return 10;
    case 'topLeft':
    case 'topRight':
    case 'bottomLeft':
    case 'bottomRight':
      return 15;
    case 'left':
    case 'right':
      return 20;
    default:
      return 50;
  }
}
