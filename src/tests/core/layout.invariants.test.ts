import { assert } from './testUtils';
import {
  clampPointToCanvas,
  createRect,
  getOverlapArea,
  getRectDistance,
  isInsideCanvas,
} from '../../domain/layout/layoutGeometry';
import { calculatePositionScore } from '../../domain/layout/layoutScoring';

type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

function overlaps(a: Rect, b: Rect, gap = 0): boolean {
  return !(
    a.x + a.width + gap <= b.x ||
    b.x + b.width + gap <= a.x ||
    a.y + a.height + gap <= b.y ||
    b.y + b.height + gap <= a.y
  );
}

export function runLayoutInvariantTests(): void {
  const a: Rect = { x: 80, y: 80, width: 200, height: 100 };
  const b: Rect = { x: 360, y: 80, width: 200, height: 100 };

  assert(!overlaps(a, b, 40), 'separated blocks must not collide');

  const c: Rect = { x: 240, y: 80, width: 200, height: 100 };
  assert(overlaps(a, c, 0), 'intersecting rectangles must collide');

  const centered = createRect(540, 960, { width: 200, height: 100 });
  assert(
    centered.x === 440 && centered.y === 910,
    'rectangle conversion must preserve center coordinates',
  );
  assert(getOverlapArea(a, c) === 4000, 'overlap area must be calculated exactly');
  assert(getRectDistance(a, b) === 80, 'rectangle distance must measure the edge-to-edge gap');
  assert(
    isInsideCanvas({ x: 80, y: 80, width: 920, height: 1760 }),
    'rectangle inside safe canvas bounds must be accepted',
  );

  const clamped = clampPointToCanvas({ x: -500, y: 3000 }, { width: 200, height: 100 });
  assert(
    clamped.x === 180 && clamped.y === 1790,
    'candidate points must clamp to the safe canvas bounds',
  );

  const candidate = createRect(540, 960, { width: 200, height: 100 });
  assert(
    calculatePositionScore(candidate, [], 'center') === 0,
    'an unobstructed centered candidate must keep the zero baseline score',
  );
  assert(
    calculatePositionScore(candidate, [candidate], 'center') >= 100000000,
    'overlapping candidates must receive the existing dominant collision penalty',
  );
  assert(
    calculatePositionScore(candidate, [], 'top') === 5,
    'position preference penalties must remain stable after extraction',
  );
}
