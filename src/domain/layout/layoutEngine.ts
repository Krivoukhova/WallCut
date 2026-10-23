import type { VisualBlockData } from '../blocks/blockTypes';
import { createRect } from './layoutGeometry';
import type { LayoutBox, LayoutRect } from './layoutGeometry';
export type { LayoutBox, LayoutRect } from './layoutGeometry';

import {
  generateGridCandidates,
  getLayoutRole,
  getRolePriority,
  getSemanticCandidates,
} from './layoutCandidates';
import type { CandidatePosition } from './layoutCandidates';

import { getBlockMetrics } from './metrics';

import type { VisualPosition } from './layoutTypes';
import { calculatePositionScore } from './layoutScoring';

export type PositionedBlock = {
  x: number;
  y: number;
  position: VisualPosition;
};

export function getAutomaticLayout(blocks: VisualBlockData[]): PositionedBlock[] {
  if (!blocks.length) {
    return [];
  }

  const boxes = blocks.map(getBlockMetrics);

  const roles = blocks.map(getLayoutRole);

  const order = blocks
    .map((block, index) => ({
      block,
      index,
      box: boxes[index],
      role: roles[index],
      area: boxes[index].width * boxes[index].height,
    }))
    .sort((a, b) => {
      const roleDifference = getRolePriority(a.role) - getRolePriority(b.role);

      if (roleDifference !== 0) {
        return roleDifference;
      }

      return b.area - a.area;
    });

  /*
   * Bounds occupied by blocks that have already been placed.
   */
  const placed: LayoutRect[] = [];

  const result: PositionedBlock[] = [];

  for (const item of order) {
    const candidates = getSemanticCandidates(item.role, item.index, blocks, item.box);

    const candidate = findBestPosition(item.box, placed, candidates);

    const rect = createRect(candidate.x, candidate.y, item.box);

    placed.push(rect);

    result[item.index] = {
      x: candidate.x,
      y: candidate.y,
      position: candidate.position,
    };
  }

  return result;
}

function findBestPosition(
  box: LayoutBox,
  placed: LayoutRect[],
  candidates: CandidatePosition[],
): CandidatePosition {
  let best: CandidatePosition | null = null;

  let bestScore = Number.POSITIVE_INFINITY;

  for (const candidate of candidates) {
    const rect = createRect(candidate.x, candidate.y, box);

    const score = calculatePositionScore(rect, placed, candidate.position);

    if (score < bestScore) {
      bestScore = score;

      best = candidate;
    }

    if (score === 0) {
      return candidate;
    }
  }

  const gridCandidates = generateGridCandidates(box);

  for (const candidate of gridCandidates) {
    const rect = createRect(candidate.x, candidate.y, box);

    const score = calculatePositionScore(rect, placed, candidate.position);

    if (score < bestScore) {
      bestScore = score;

      best = candidate;
    }

    if (score === 0) {
      return candidate;
    }
  }

  return (
    best ?? {
      x: 540,
      y: 960,
      position: 'center',
    }
  );
}

