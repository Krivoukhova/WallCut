import type { VisualBlockData } from '../blocks/blockTypes';
import { CANVAS_HEIGHT, CANVAS_WIDTH, SAFE_MARGIN, clampPointToCanvas } from './layoutGeometry';
import type { LayoutBox, LayoutPoint } from './layoutGeometry';
import type { VisualPosition } from './layoutTypes';

const POSITION_MAP: Record<VisualPosition, LayoutPoint> = {
  top: {
    x: 540,
    y: 300,
  },

  center: {
    x: 540,
    y: 960,
  },

  bottom: {
    x: 540,
    y: 1560,
  },

  left: {
    x: 270,
    y: 960,
  },

  right: {
    x: 810,
    y: 960,
  },

  topLeft: {
    x: 280,
    y: 300,
  },

  topRight: {
    x: 800,
    y: 300,
  },

  centerLeft: {
    x: 300,
    y: 960,
  },

  centerRight: {
    x: 780,
    y: 960,
  },

  bottomLeft: {
    x: 280,
    y: 1560,
  },

  bottomRight: {
    x: 800,
    y: 1560,
  },
};

const ALL_POSITIONS: VisualPosition[] = [
  'center',
  'top',
  'bottom',
  'centerLeft',
  'centerRight',
  'topLeft',
  'topRight',
  'bottomLeft',
  'bottomRight',
  'left',
  'right',
];

type LayoutRole = 'title' | 'primary' | 'visual' | 'secondary' | 'support' | 'decorative';

export function getLayoutRole(block: VisualBlockData): LayoutRole {
  switch (block.type) {
    case 'text':
      return 'title';

    case 'number':
    case 'money':
      return 'primary';

    case 'chart':
    case 'barChart':
      return 'visual';

    case 'stat':
    case 'metric':
    case 'comparison':
      return 'secondary';

    case 'badge':
      return 'support';

    case 'rectangle':
    case 'circle':
    case 'line':
    case 'arrow':
    case 'bar':
    case 'progress':
    case 'image':
      return 'decorative';

    default:
      return 'decorative';
  }
}

/* Lower scores are considered earlier in the placement order. */
export function getRolePriority(role: LayoutRole): number {
  switch (role) {
    case 'title':
      return 0;

    case 'primary':
      return 1;

    case 'visual':
      return 2;

    case 'secondary':
      return 3;

    case 'support':
      return 4;

    case 'decorative':
      return 5;

    default:
      return 10;
  }
}

export type CandidatePosition = {
  x: number;
  y: number;
  position: VisualPosition;
};

export function getSemanticCandidates(
  role: LayoutRole,
  index: number,
  blocks: VisualBlockData[],
  box: LayoutBox,
): CandidatePosition[] {
  const candidates: CandidatePosition[] = [];

  const total = blocks.length;

  if (role === 'title') {
    candidates.push(
      createCandidate(540, 280, 'top', box),

      createCandidate(540, 400, 'top', box),

      createCandidate(280, 300, 'topLeft', box),

      createCandidate(800, 300, 'topRight', box),

      createCandidate(540, 550, 'center', box),
    );
  }

  if (role === 'primary') {
    candidates.push(
      createCandidate(540, 700, 'center', box),

      createCandidate(540, 800, 'center', box),

      createCandidate(540, 600, 'center', box),

      createCandidate(300, 750, 'centerLeft', box),

      createCandidate(780, 750, 'centerRight', box),

      createCandidate(540, 1100, 'center', box),
    );
  }

  if (role === 'visual') {
    candidates.push(
      createCandidate(540, 1100, 'center', box),

      createCandidate(540, 1050, 'center', box),

      createCandidate(540, 1200, 'center', box),

      createCandidate(540, 1350, 'bottom', box),

      createCandidate(280, 1100, 'centerLeft', box),

      createCandidate(800, 1100, 'centerRight', box),

      createCandidate(540, 800, 'center', box),
    );
  }

  if (role === 'secondary') {
    candidates.push(
      createCandidate(540, 1580, 'bottom', box),

      createCandidate(540, 1650, 'bottom', box),

      createCandidate(540, 1500, 'bottom', box),

      createCandidate(300, 1550, 'bottomLeft', box),

      createCandidate(780, 1550, 'bottomRight', box),

      createCandidate(300, 1250, 'centerLeft', box),

      createCandidate(780, 1250, 'centerRight', box),
    );
  }

  if (role === 'support') {
    candidates.push(
      createCandidate(540, 1250, 'center', box),

      createCandidate(540, 1400, 'bottom', box),

      createCandidate(540, 1550, 'bottom', box),

      createCandidate(300, 1250, 'centerLeft', box),

      createCandidate(780, 1250, 'centerRight', box),
    );
  }

  if (role === 'decorative') {
    for (const position of getDistributedPositions(index, total)) {
      const point = POSITION_MAP[position];

      candidates.push(createCandidate(point.x, point.y, position, box));
    }
  }

  for (const position of ALL_POSITIONS) {
    const point = POSITION_MAP[position];

    candidates.push(createCandidate(point.x, point.y, position, box));
  }

  return deduplicateCandidates(candidates);
}

function createCandidate(
  x: number,
  y: number,
  position: VisualPosition,
  box: LayoutBox,
): CandidatePosition {
  const safePoint = clampPointToCanvas(
    {
      x,
      y,
    },
    box,
  );

  return {
    x: safePoint.x,
    y: safePoint.y,
    position,
  };
}

export function generateGridCandidates(box: LayoutBox): CandidatePosition[] {
  const candidates: CandidatePosition[] = [];

  const step = 70;

  for (
    let y = SAFE_MARGIN + box.height / 2;
    y <= CANVAS_HEIGHT - SAFE_MARGIN - box.height / 2;
    y += step
  ) {
    for (
      let x = SAFE_MARGIN + box.width / 2;
      x <= CANVAS_WIDTH - SAFE_MARGIN - box.width / 2;
      x += step
    ) {
      candidates.push({
        x,
        y,
        position: getNearestPosition(x, y),
      });
    }
  }

  return candidates;
}

function getDistributedPositions(index: number, totalBlocks: number): VisualPosition[] {
  if (totalBlocks === 2) {
    return index === 0
      ? ['centerLeft', 'centerRight', 'top', 'bottom']
      : ['centerRight', 'centerLeft', 'top', 'bottom'];
  }

  if (totalBlocks === 3) {
    if (index === 0) {
      return ['top', 'centerLeft', 'centerRight'];
    }

    if (index === 1) {
      return ['center', 'centerLeft', 'centerRight'];
    }

    return ['bottom', 'centerLeft', 'centerRight'];
  }

  return ALL_POSITIONS;
}

function getNearestPosition(x: number, y: number): VisualPosition {
  let best: VisualPosition | null = null;

  let bestDistance = Number.POSITIVE_INFINITY;

  for (const position of ALL_POSITIONS) {
    const point = POSITION_MAP[position];

    const dx = x - point.x;

    const dy = y - point.y;

    const distance = dx * dx + dy * dy;

    if (distance < bestDistance) {
      bestDistance = distance;

      best = position;
    }
  }

  return best ?? 'center';
}

function deduplicateCandidates(candidates: CandidatePosition[]): CandidatePosition[] {
  const result: CandidatePosition[] = [];

  const seen = new Set<string>();

  for (const candidate of candidates) {
    const key = `${Math.round(candidate.x)}:${Math.round(candidate.y)}`;

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);

    result.push(candidate);
  }

  return result;
}
