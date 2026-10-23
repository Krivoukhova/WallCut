export type LayoutPoint = {
  x: number;
  y: number;
};

export type LayoutBox = {
  width: number;
  height: number;
};

export type LayoutRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export const CANVAS_WIDTH = 1080;
export const CANVAS_HEIGHT = 1920;
export const SAFE_MARGIN = 80;

export function createRect(x: number, y: number, box: LayoutBox): LayoutRect {
  return {
    x: x - box.width / 2,
    y: y - box.height / 2,
    width: box.width,
    height: box.height,
  };
}

export function getOverlapArea(a: LayoutRect, b: LayoutRect): number {
  const left = Math.max(a.x, b.x);
  const right = Math.min(a.x + a.width, b.x + b.width);
  const top = Math.max(a.y, b.y);
  const bottom = Math.min(a.y + a.height, b.y + b.height);

  if (right <= left || bottom <= top) {
    return 0;
  }

  return (right - left) * (bottom - top);
}

export function getRectDistance(a: LayoutRect, b: LayoutRect): number {
  const aRight = a.x + a.width;
  const aBottom = a.y + a.height;
  const bRight = b.x + b.width;
  const bBottom = b.y + b.height;

  const dx = Math.max(b.x - aRight, a.x - bRight, 0);
  const dy = Math.max(b.y - aBottom, a.y - bBottom, 0);

  return Math.sqrt(dx * dx + dy * dy);
}

export function isInsideCanvas(rect: LayoutRect): boolean {
  return (
    rect.x >= SAFE_MARGIN &&
    rect.y >= SAFE_MARGIN &&
    rect.x + rect.width <= CANVAS_WIDTH - SAFE_MARGIN &&
    rect.y + rect.height <= CANVAS_HEIGHT - SAFE_MARGIN
  );
}

export function clampPointToCanvas(point: LayoutPoint, box: LayoutBox): LayoutPoint {
  const minX = SAFE_MARGIN + box.width / 2;
  const maxX = CANVAS_WIDTH - SAFE_MARGIN - box.width / 2;
  const minY = SAFE_MARGIN + box.height / 2;
  const maxY = CANVAS_HEIGHT - SAFE_MARGIN - box.height / 2;

  return {
    x: minX > maxX ? CANVAS_WIDTH / 2 : clamp(point.x, minX, maxX),
    y: minY > maxY ? CANVAS_HEIGHT / 2 : clamp(point.y, minY, maxY),
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}
