import type { VisualBlockData } from '../domain/blocks/blockTypes';

type PlacementBlock = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  scale?: number;
  scaleX?: number;
  scaleY?: number;
  rotation?: number;
};

type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const CANVAS_WIDTH = 1080;
const CANVAS_HEIGHT = 1920;

const SAFE_MARGIN = 80;
const COLLISION_GAP = 80;

const DEFAULT_WIDTH = 320;
const DEFAULT_HEIGHT = 120;

function getBlockWidth(block: PlacementBlock): number {
  return (block.width ?? DEFAULT_WIDTH) * (block.scale ?? 1) * (block.scaleX ?? 1);
}

function getBlockHeight(block: PlacementBlock): number {
  return (block.height ?? DEFAULT_HEIGHT) * (block.scale ?? 1) * (block.scaleY ?? 1);
}

function getRect(block: PlacementBlock): Rect {
  return {
    x: block.x ?? CANVAS_WIDTH / 2,
    y: block.y ?? CANVAS_HEIGHT / 2,
    width: getBlockWidth(block),
    height: getBlockHeight(block),
  };
}

/** Checks rectangle overlap using center coordinates and the configured clearance gap. */
function rectanglesOverlap(a: Rect, b: Rect): boolean {
  const horizontalDistance = Math.abs(a.x - b.x);

  const verticalDistance = Math.abs(a.y - b.y);

  const requiredHorizontalDistance = a.width / 2 + b.width / 2 + COLLISION_GAP;

  const requiredVerticalDistance = a.height / 2 + b.height / 2 + COLLISION_GAP;

  return (
    horizontalDistance < requiredHorizontalDistance && verticalDistance < requiredVerticalDistance
  );
}

function isInsideCanvas(rect: Rect): boolean {
  const halfWidth = rect.width / 2;

  const halfHeight = rect.height / 2;

  return (
    rect.x - halfWidth >= SAFE_MARGIN &&
    rect.x + halfWidth <= CANVAS_WIDTH - SAFE_MARGIN &&
    rect.y - halfHeight >= SAFE_MARGIN &&
    rect.y + halfHeight <= CANVAS_HEIGHT - SAFE_MARGIN
  );
}

function getCandidateStep(width: number, height: number): number {
  return Math.max(120, Math.min(width, height) + COLLISION_GAP);
}

export function findFreeBlockPosition(
  newBlock: VisualBlockData,
  existingBlocks: VisualBlockData[],
): {
  x: number;
  y: number;
} {
  const width = getBlockWidth(newBlock);

  const height = getBlockHeight(newBlock);

  const centerX = CANVAS_WIDTH / 2;

  const centerY = CANVAS_HEIGHT / 2;

  // Prefer the canvas center when it is available.
  const candidates: Array<{
    x: number;
    y: number;
  }> = [
    {
      x: centerX,
      y: centerY,
    },
  ];

  const step = getCandidateStep(width, height);

  // Search outward from the center, checking cardinal and diagonal positions at each radius.
  for (let radius = step; radius <= 1800; radius += step) {
    candidates.push(
      {
        x: centerX + radius,
        y: centerY,
      },
      {
        x: centerX - radius,
        y: centerY,
      },
      {
        x: centerX,
        y: centerY + radius,
      },
      {
        x: centerX,
        y: centerY - radius,
      },
      {
        x: centerX + radius,
        y: centerY + radius,
      },
      {
        x: centerX - radius,
        y: centerY + radius,
      },
      {
        x: centerX + radius,
        y: centerY - radius,
      },
      {
        x: centerX - radius,
        y: centerY - radius,
      },
    );
  }

  // Scan the canvas on a grid if the radial candidates do not provide a free position.
  const gridStep = 80;

  const minX = SAFE_MARGIN + width / 2;

  const maxX = CANVAS_WIDTH - SAFE_MARGIN - width / 2;

  const minY = SAFE_MARGIN + height / 2;

  const maxY = CANVAS_HEIGHT - SAFE_MARGIN - height / 2;

  if (minX <= maxX && minY <= maxY) {
    for (let y = minY; y <= maxY; y += gridStep) {
      for (let x = minX; x <= maxX; x += gridStep) {
        candidates.push({
          x,
          y,
        });
      }
    }
  }

  // Return the first candidate that fits within the canvas and avoids existing blocks.
  for (const candidate of candidates) {
    const rect: Rect = {
      x: candidate.x,
      y: candidate.y,
      width,
      height,
    };

    if (!isInsideCanvas(rect)) {
      continue;
    }

    const collides = existingBlocks.some((existingBlock) =>
      rectanglesOverlap(rect, getRect(existingBlock)),
    );

    if (!collides) {
      return candidate;
    }
  }

  // If no collision-free position exists, clamp the fallback to the canvas bounds.
  const fallbackX = Math.max(minX, Math.min(centerX, maxX));

  const fallbackY = Math.max(minY, Math.min(centerY, maxY));

  return {
    x: fallbackX,
    y: fallbackY,
  };
}
