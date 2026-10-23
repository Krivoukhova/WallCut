import type { TTSSegment, TTSTimeline } from './ttsTimelineTypes';
import type { VisualTimelineData } from './visualTimelineTypes';
import { resolveSceneDuration } from './duration';

function cloneSegment(
  source: TTSSegment | undefined,
  id: string,
  durationFrames: number,
  startFrame: number,
  fps: number,
): TTSSegment {
  const duration = durationFrames / fps;
  const sampleRate = source?.sampleRate ?? 48000;
  const samples = Math.max(0, Math.round(duration * sampleRate));

  return {
    id,
    name: source?.name,
    text: source?.text ?? '',
    audio: source?.audio ?? '',
    sampleRate,
    samples,
    startTime: startFrame / fps,
    endTime: (startFrame + durationFrames) / fps,
    duration,
    startFrame,
    endFrame: startFrame + durationFrames,
    durationFrames,
  };
}

/**
 * Builds the editor's scene timeline from the persisted visual timeline.
 * Visual scenes are the source of truth for scene count/order/duration;
 * the original TTS timeline only supplies voice/text metadata where it exists.
 */
export function buildEditorTimeline(
  baseTimeline: TTSTimeline,
  visualTimeline: VisualTimelineData,
): TTSTimeline {
  let cursor = 0;

  const segments = visualTimeline.segments.map((visualSegment) => {
    const source = baseTimeline.segments.find((candidate) => candidate.id === visualSegment.id);
    const durationFrames = resolveSceneDuration(visualSegment.durationFrames);
    const segment = cloneSegment(
      source,
      visualSegment.id,
      durationFrames,
      cursor,
      baseTimeline.fps,
    );
    segment.name = visualSegment.name ?? source?.name;
    cursor += durationFrames;
    return segment;
  });

  return {
    ...baseTimeline,
    segments,
    totalFrames: cursor,
    totalDuration: cursor / baseTimeline.fps,
    totalSamples: Math.round((cursor / baseTimeline.fps) * baseTimeline.sampleRate),
  };
}
