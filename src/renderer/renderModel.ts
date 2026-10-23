import { resolveSceneDuration } from '../domain/timeline/duration';
import { resolveBackground, type BackgroundStyle } from '../domain/background/backgroundTypes';
import type {
  VisualTimelineData,
  VisualTimelineSegment,
} from '../domain/timeline/visualTimelineTypes';

export type RenderScene = {
  id: string;
  name?: string;
  startFrame: number;
  durationFrames: number;
  blocks: VisualTimelineSegment['blocks'];
  /** Fully resolved background for this scene (scene override > project > default). */
  background: BackgroundStyle;
  contentOpacity: number;
};

export type RenderAudioTrack = {
  id: string;
  publicPath: string;
  state: {
    startFrame: number;
    durationFrames: number;
    sourceStartFrame: number;
    sourceEndFrame: number;
    volume: number;
    muted: boolean;
  };
};

export type RenderModel = {
  fps: number;
  durationInFrames: number;
  scenes: RenderScene[];
  audioTracks: RenderAudioTrack[];
};

export function compileRenderModel(
  visualTimeline: VisualTimelineData,
  fps: number,
  audioTracks: RenderAudioTrack[] = [],
  projectBackground?: BackgroundStyle | null,
): RenderModel {
  let cursor = 0;

  const scenes = visualTimeline.segments.map((segment) => {
    const durationFrames = resolveSceneDuration(segment.durationFrames);
    const scene: RenderScene = {
      id: segment.id,
      name: segment.name,
      startFrame: cursor,
      durationFrames,
      blocks: segment.blocks,
      background: resolveBackground(segment.background, projectBackground),
      contentOpacity: segment.contentOpacity ?? 1,
    };
    cursor += durationFrames;
    return scene;
  });

  return {
    fps,
    durationInFrames: cursor,
    scenes,
    audioTracks,
  };
}
