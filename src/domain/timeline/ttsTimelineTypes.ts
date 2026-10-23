export type TTSSegment = {
  id: string;
  name?: string;
  text: string;
  audio?: string;

  sampleRate: number;
  samples: number;

  startTime: number;
  endTime: number;

  duration: number;

  startFrame: number;
  endFrame: number;
  durationFrames: number;
};

export type TTSTimeline = {
  fps: number;
  sampleRate: number;
  voice: string;

  segments: TTSSegment[];

  totalSamples: number;
  totalDuration: number;
  totalFrames: number;

  voiceover: {
    file: string;
    publicPath: string;
  };
};
