import React from 'react';

import { Composition } from 'remotion';

import { MyComponent, calculateMetadata, type RenderProps } from './Composition';

import timelineData from './data/timeline.json';

import type { TTSTimeline } from './domain/timeline/ttsTimelineTypes';

const timeline = timelineData as TTSTimeline;

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="WallCutVerticalVideo"
      component={MyComponent}
      durationInFrames={timeline.totalFrames}
      fps={30}
      width={1080}
      height={1920}
      calculateMetadata={calculateMetadata}
      defaultProps={
        {
          timeline,
          includeAudio: false,
          audioSrc: null,
        } satisfies RenderProps
      }
    />
  );
};
