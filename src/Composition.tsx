import React from 'react';

import {
  AbsoluteFill,
  CalculateMetadataFunction,
  Composition,
  Sequence,
  staticFile,
} from 'remotion';
import { Audio } from '@remotion/media';

import { SpeechVisualTimeline } from './components/SpeechVisualTimeline';
import { compileRenderModel } from './renderer/renderModel';

import visualTimelineData from './data/visualTimeline.json';
import type { VisualTimelineData } from './domain/timeline/visualTimelineTypes';
import type { BackgroundStyle } from './domain/background/backgroundTypes';

import timelineData from './data/timeline.json';
import type { TTSTimeline } from './domain/timeline/ttsTimelineTypes';
import type { AudioTrackState } from './editor/timeline/audioTrackTypes';

export type RenderProps = {
  timeline?: TTSTimeline;
  visualTimeline?: VisualTimelineData;
  background?: BackgroundStyle | null;
  includeAudio?: boolean;
  audioSrc?: string | null;
  audioState?: AudioTrackState | null;
};

const FPS = 30;

const defaultTimeline = timelineData as TTSTimeline;
const defaultVisualTimeline = visualTimelineData as VisualTimelineData;

const getTimeline = (props?: RenderProps) => props?.timeline ?? defaultTimeline;

export const calculateMetadata: CalculateMetadataFunction<RenderProps> = ({ props }) => {
  const timeline = getTimeline(props);

  return {
    durationInFrames: timeline.totalFrames,
    fps: FPS,
    width: 1080,
    height: 1920,
  };
};

export const MyComposition = () => {
  return (
    <Composition
      id="WallCutVerticalVideo"
      component={MyComponent}
      durationInFrames={defaultTimeline.totalFrames}
      fps={FPS}
      width={1080}
      height={1920}
      calculateMetadata={calculateMetadata}
      defaultProps={{
        timeline: defaultTimeline,
        visualTimeline: defaultVisualTimeline,
        includeAudio: false,
        audioSrc: null,
      }}
    />
  );
};

export const MyComponent: React.FC<RenderProps> = ({
  timeline = defaultTimeline,
  visualTimeline = defaultVisualTimeline,
  background,
  includeAudio = false,
  audioSrc = null,
  audioState,
}) => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#111111',
        fontFamily: 'Arial, sans-serif',
        color: 'white',
      }}
    >
      {includeAudio && audioSrc ? (
        <Sequence
          from={audioState?.startFrame ?? 0}
          durationInFrames={audioState?.durationFrames ?? timeline.totalFrames}
        >
          <Audio
            src={staticFile(audioSrc)}
            trimBefore={audioState?.sourceStartFrame ?? 0}
            trimAfter={audioState?.sourceEndFrame}
            volume={audioState?.volume ?? 1}
            muted={audioState?.muted ?? false}
          />
        </Sequence>
      ) : null}

      <SpeechVisualTimeline
        renderModel={compileRenderModel(visualTimeline, timeline.fps, [], background)}
      />
    </AbsoluteFill>
  );
};
