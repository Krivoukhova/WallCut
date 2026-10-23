import type { ShortsProject } from '../../domain/project/projectTypes';

export type EditorAudioTrack = NonNullable<ShortsProject['audioTracks']>[number] & {
  binary: ArrayBuffer;
  publicPath: string;
};

export type SplitAudioTrackResult = {
  tracks: EditorAudioTrack[];
  didSplit: boolean;
  secondTrackId?: string;
};

/** Split one timeline segment while preserving its shared underlying audio asset. */
export function splitAudioTrack(
  tracks: EditorAudioTrack[],
  trackId: string,
  splitFrame: number,
  secondTrackId: string,
): SplitAudioTrackResult {
  const source = tracks.find((track) => track.id === trackId);
  if (!source) return { tracks, didSplit: false };

  const start = source.state.startFrame;
  const end = start + source.state.durationFrames;
  const cut = Math.round(splitFrame);
  if (cut <= start || cut >= end) return { tracks, didSplit: false };

  const firstDuration = cut - start;
  const secondDuration = end - cut;
  const sourceStart = source.state.sourceStartFrame;
  const sourceEnd = source.state.sourceEndFrame;

  const first: EditorAudioTrack = {
    ...source,
    state: {
      ...source.state,
      durationFrames: firstDuration,
      sourceEndFrame: sourceStart + firstDuration,
    },
  };
  const second: EditorAudioTrack = {
    ...source,
    id: secondTrackId,
    state: {
      ...source.state,
      startFrame: cut,
      durationFrames: secondDuration,
      sourceStartFrame: sourceStart + firstDuration,
      sourceEndFrame: sourceEnd,
    },
  };

  return {
    tracks: tracks.flatMap((track) => (track.id === trackId ? [first, second] : [track])),
    didSplit: true,
    secondTrackId,
  };
}

export function fingerprintAudioTracks(tracks: EditorAudioTrack[]): string {
  return JSON.stringify(
    tracks.map(({ id, state, fileName, mimeType }) => ({ id, state, fileName, mimeType })),
  );
}
