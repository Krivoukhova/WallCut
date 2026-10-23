import { useCallback, useRef, useState } from 'react';

import type { VisualTimelineData } from '../domain/timeline/visualTimelineTypes';
import type { CloneService } from '../application/runtime/runtimeServices';
import { createTimelineCommand } from '../application/commands/TimelineCommand';
import type { TimelineCommand } from '../application/commands/TimelineCommand';
import {
  TimelineHistoryService,
  type EditorTransactionType,
} from '../application/history/TimelineHistoryService';

export type EditorHistory = {
  timeline: VisualTimelineData;
  timelineRef: React.MutableRefObject<VisualTimelineData>;
  canUndo: boolean;
  canRedo: boolean;
  executeCommand: (command: TimelineCommand) => void;
  /** @deprecated Use executeCommand for new application code. */
  commitTimelineChange: (
    updater: (timeline: VisualTimelineData) => VisualTimelineData,
  ) => VisualTimelineData;
  beginInteraction: () => void;
  endInteraction: () => void;
  beginTextEdit: () => void;
  endTextEdit: () => void;
  beginInspectorEdit: () => void;
  endInspectorEdit: () => void;
  beginColorEdit: () => void;
  commitColorEdit: () => void;
  undo: () => void;
  redo: () => void;
};

export function useEditorHistory({
  initialTimeline,
  clone,
}: {
  initialTimeline: VisualTimelineData;
  clone: CloneService;
}): EditorHistory {
  const serviceRef = useRef<TimelineHistoryService | null>(null);
  if (!serviceRef.current) {
    serviceRef.current = new TimelineHistoryService(initialTimeline, clone);
  }

  const service = serviceRef.current;
  const [timeline, setTimeline] = useState(service.timeline);
  const timelineRef = useRef(service.timeline);
  const [, forceUpdate] = useState(0);

  const sync = useCallback(() => {
    const next = service.timeline;
    timelineRef.current = next;
    setTimeline(next);
    forceUpdate((value) => value + 1);
  }, [service]);

  const executeCommand = useCallback(
    (command: TimelineCommand) => {
      if (service.execute(command)) sync();
    },
    [service, sync],
  );

  const commitTimelineChange = useCallback(
    (updater: (timeline: VisualTimelineData) => VisualTimelineData): VisualTimelineData => {
      executeCommand(
        createTimelineCommand({
          id: 'timeline.update',
          label: 'Update timeline',
          execute: updater,
        }),
      );
      return service.timeline;
    },
    [executeCommand, service],
  );

  const beginTransaction = useCallback(
    (type: EditorTransactionType) => {
      service.beginTransaction(type);
      sync();
    },
    [service, sync],
  );

  const endTransaction = useCallback(
    (type: EditorTransactionType) => {
      if (service.activeTransactionType === type) {
        service.commitTransaction();
        sync();
      }
    },
    [service, sync],
  );

  const beginColorEdit = useCallback(() => {
    service.beginColorEdit();
    sync();
  }, [service, sync]);

  const commitColorEdit = useCallback(() => {
    if (service.commitColorEdit()) sync();
  }, [service, sync]);

  const beginInteraction = useCallback(() => {
    service.commitColorEdit();
    beginTransaction('interaction');
  }, [service, beginTransaction]);

  const endInteraction = useCallback(() => {
    endTransaction('interaction');
  }, [endTransaction]);

  const beginTextEdit = useCallback(() => {
    service.commitColorEdit();
    beginTransaction('text');
  }, [service, beginTransaction]);

  const endTextEdit = useCallback(() => {
    endTransaction('text');
  }, [endTransaction]);

  const beginInspectorEdit = useCallback(() => {
    service.commitColorEdit();
    beginTransaction('inspector');
  }, [service, beginTransaction]);

  const endInspectorEdit = useCallback(() => {
    endTransaction('inspector');
  }, [endTransaction]);

  const undo = useCallback(() => {
    if (service.undo() !== null) sync();
  }, [service, sync]);

  const redo = useCallback(() => {
    if (service.redo() !== null) sync();
  }, [service, sync]);

  return {
    timeline,
    timelineRef,
    canUndo: service.canUndo,
    canRedo: service.canRedo,
    executeCommand,
    commitTimelineChange,
    beginInteraction,
    endInteraction,
    beginTextEdit,
    endTextEdit,
    beginInspectorEdit,
    endInspectorEdit,
    beginColorEdit,
    commitColorEdit,
    undo,
    redo,
  };
}
