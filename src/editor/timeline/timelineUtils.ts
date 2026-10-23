import type { ResolvedEditorBlock } from '../editorTypes';

import type { TrackId, TimelineSubTrack } from './timelineTypes';

import { SNAP_FRAME_STEP, SNAP_FRAME_THRESHOLD } from './timelineConstants';

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function snapFrame(value: number, candidates: number[]): number {
  let best = value;

  let bestDistance = SNAP_FRAME_THRESHOLD + 1;

  for (const candidate of candidates) {
    const distance = Math.abs(value - candidate);

    if (distance <= SNAP_FRAME_THRESHOLD && distance < bestDistance) {
      best = candidate;
      bestDistance = distance;
    }
  }

  if (best === value) {
    const stepped = Math.round(value / SNAP_FRAME_STEP) * SNAP_FRAME_STEP;

    if (Math.abs(stepped - value) <= SNAP_FRAME_THRESHOLD) {
      return stepped;
    }
  }

  return best;
}

export function formatTime(frame: number, fps: number): string {
  const seconds = Math.max(0, frame / fps);

  const minutes = Math.floor(seconds / 60);

  const remainingSeconds = Math.floor(seconds % 60);

  const frames = Math.floor(frame % fps);

  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}.${String(
    frames,
  ).padStart(2, '0')}`;
}

export function getTrackId(block: ResolvedEditorBlock): TrackId {
  if (block.block.layer) {
    return block.block.layer;
  }

  const type = String(block.block.type ?? '').toLowerCase();

  if (type.includes('background') || type === 'bg') {
    return 'background';
  }

  if (type.includes('image') || type.includes('photo') || type.includes('icon')) {
    return 'image';
  }

  if (type.includes('character') || type.includes('person') || type.includes('avatar')) {
    return 'character';
  }

  if (
    type.includes('text') ||
    type.includes('subtitle') ||
    type.includes('title') ||
    type.includes('caption')
  ) {
    return 'text';
  }

  if (
    type.includes('shape') ||
    type.includes('rect') ||
    type.includes('circle') ||
    type.includes('line')
  ) {
    return 'shape';
  }

  return 'other';
}

// Prefer a clip's previous lane to avoid unnecessary vertical movement, but
// never preserve a lane assignment when it would overlap another clip. This is
// important after moving/resizing clips: stale lane assignments used to leave
// two clips stacked on top of one another.
const stableLaneByEditorId = new Map<string, number>();

export function buildSubTracks(blocks: ResolvedEditorBlock[]): TimelineSubTrack[] {
  const sorted = [...blocks].sort(
    (a, b) =>
      a.absoluteStartFrame - b.absoluteStartFrame ||
      (a.block.zIndex ?? 0) - (b.block.zIndex ?? 0) ||
      a.index - b.index,
  );

  const tracks: TimelineSubTrack[] = [];
  const overlapsInLane = (lane: number, start: number, end: number) =>
    (tracks[lane]?.blocks ?? []).some((placed) => {
      const placedStart = placed.absoluteStartFrame;
      const placedEnd = placedStart + placed.duration;
      return start < placedEnd && end > placedStart;
    });

  for (const block of sorted) {
    const start = block.absoluteStartFrame;
    const end = start + Math.max(1, block.duration);
    const preferredLane = stableLaneByEditorId.get(block.editorId);

    // Reuse the previous lane only if it remains collision-free. Otherwise
    // choose the first available lane so overlaps are represented separately.
    let lane = preferredLane ?? 0;
    if (overlapsInLane(lane, start, end)) {
      lane = 0;
      while (overlapsInLane(lane, start, end)) lane += 1;
    }

    while (tracks.length <= lane) {
      tracks.push({ blocks: [], endFrame: 0 });
    }
    tracks[lane].blocks.push(block);
    tracks[lane].endFrame = Math.max(tracks[lane].endFrame, end);
    stableLaneByEditorId.set(block.editorId, lane);
  }

  // Compact empty lanes and refresh cached lane numbers after compaction.
  const compacted = tracks.filter((track) => track.blocks.length > 0);
  compacted.forEach((track, laneIndex) => {
    for (const block of track.blocks) {
      stableLaneByEditorId.set(block.editorId, laneIndex);
    }
  });
  return compacted;
}
