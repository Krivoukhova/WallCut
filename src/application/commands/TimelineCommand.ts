import type { VisualTimelineData } from '../../domain/timeline/visualTimelineTypes';
import type { EditorCommand } from './EditorCommand';

export type TimelineCommand = EditorCommand<VisualTimelineData>;

export function createTimelineCommand(options: {
  id: string;
  label: string;
  execute: (timeline: VisualTimelineData) => VisualTimelineData;
}): TimelineCommand {
  return options;
}
