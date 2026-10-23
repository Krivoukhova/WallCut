import { assertEqual } from './testUtils';
import { buildEditorTimeline } from '../../domain/timeline/editorTimeline';
import type { TTSTimeline } from '../../domain/timeline/ttsTimelineTypes';
import type { VisualTimelineData } from '../../domain/timeline/visualTimelineTypes';

const segment = (id: string, startFrame: number): TTSTimeline['segments'][number] => ({
  id,
  text: `voice-${id}`,
  audio: `${id}.wav`,
  sampleRate: 48000,
  samples: 48000,
  startTime: startFrame / 30,
  endTime: (startFrame + 30) / 30,
  duration: 1,
  startFrame,
  endFrame: startFrame + 30,
  durationFrames: 30,
});

export function runEditorTimelineInvariantTests(): void {
  const base: TTSTimeline = {
    fps: 30,
    sampleRate: 48000,
    voice: 'test',
    segments: [segment('scene-a', 0), segment('scene-b', 30)],
    totalSamples: 96000,
    totalDuration: 2,
    totalFrames: 60,
    voiceover: { file: '', publicPath: '' },
  };

  const visual: VisualTimelineData = {
    segments: [
      { id: 'scene-b', blocks: [], durationFrames: 30 },
      { id: 'scene-a', blocks: [], durationFrames: 30 },
    ],
  };

  const result = buildEditorTimeline(base, visual);
  assertEqual(
    result.segments[0]?.text,
    'voice-scene-b',
    'TTS metadata follows stable scene id after reorder',
  );
  assertEqual(
    result.segments[1]?.text,
    'voice-scene-a',
    'TTS metadata does not follow array index after reorder',
  );
  assertEqual(result.segments[0]?.startFrame, 0, 'reordered first scene starts at zero');
  assertEqual(
    result.segments[1]?.startFrame,
    30,
    'reordered second scene starts after first scene',
  );
}
