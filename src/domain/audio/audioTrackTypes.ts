export type AudioTrackState = {
  startFrame: number;
  durationFrames: number;
  sourceStartFrame: number;
  sourceEndFrame: number;
  volume: number;
  muted: boolean;
};

export const createDefaultAudioTrackState = (durationFrames: number): AudioTrackState => ({
  startFrame: 0,
  durationFrames,
  sourceStartFrame: 0,
  sourceEndFrame: durationFrames,
  volume: 1,
  muted: false,
});
