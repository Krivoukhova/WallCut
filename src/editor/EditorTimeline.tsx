import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { ResolvedEditorBlock } from './editorTypes';
import type { TTSSegment, TTSTimeline } from '../domain/timeline/ttsTimelineTypes';

import type { TrackId } from './timeline/timelineTypes';

import { TimelineView } from './timeline/TimelineView';
import { TimelineToolbar } from './timeline/TimelineToolbar';
import { SceneStrip } from './timeline/SceneStrip';

import { clamp } from './timeline/timelineUtils';

import { useTimelineModel } from './timeline/hooks/useTimelineModel';
import { useTimelinePanelSizing } from './timeline/hooks/useTimelinePanelSizing';
import { useTimelineBlockInteraction } from './timeline/hooks/useTimelineBlockInteraction';
import type { AudioTrackState } from './timeline/audioTrackTypes';
import type { LocalAudioTrack } from '../application/project/projectService';

type EditorTimelineProps = {
  blocks: ResolvedEditorBlock[];
  segments: TTSSegment[];
  timeline: TTSTimeline;

  selectedBlockId: string | null;
  currentFrame: number;
  durationInFrames: number;
  fps: number;

  onSelect: (id: string | null) => void;
  onFrameChange: (frame: number) => void;

  onMoveBlock: (editorId: string, startFrame: number) => string | void;

  onResizeBlock: (editorId: string, startFrame: number, duration: number) => void;

  onChangeBlockLayer: (editorId: string, layer: TrackId) => void;

  onInteractionStart?: () => void;
  onInteractionEnd?: () => void;
  audioTracks: Array<LocalAudioTrack & { publicPath: string }>;
  onAudioStateChange: (trackId: string, patch: Partial<AudioTrackState>) => void;
  onAudioAdd: (file: File) => void;
  audioSelectedId?: string | null;
  onAudioSelect?: (trackId: string) => void;
  onAudioContextMenu?: (trackId: string, event: React.MouseEvent<HTMLDivElement>) => void;

  selectedSceneId?: string | null;
  onSceneSelect?: (sceneId: string) => void;
  onSceneAdd?: () => void;
  onSceneReorder?: (sceneId: string, targetIndex: number) => void;
  onSceneDuplicate?: (sceneId?: string) => void;
  onSceneDelete?: (sceneId?: string) => void;
  onSceneDurationChange?: (sceneId: string, durationFrames: number) => void;
  onSplitBlock?: (editorId: string, localFrame: number) => void;
  onSplitAudio?: (trackId: string, splitFrame: number) => void;
};

export const EditorTimeline: React.FC<EditorTimelineProps> = ({
  blocks,
  segments,
  timeline,
  selectedBlockId,
  currentFrame,
  durationInFrames,
  fps,

  onSelect,
  onFrameChange,

  onMoveBlock,
  onResizeBlock,

  onChangeBlockLayer,

  onInteractionStart,
  onInteractionEnd,
  audioTracks,
  onAudioStateChange,
  onAudioAdd,
  audioSelectedId,
  onAudioSelect,
  onAudioContextMenu,
  selectedSceneId,
  onSceneSelect,
  onSceneAdd,
  onSceneReorder,
  onSceneDuplicate,
  onSceneDelete,
  onSceneDurationChange,
  onSplitAudio,
}) => {

  const [collapsed, setCollapsed] = useState<Record<TrackId, boolean>>(
    {} as Record<TrackId, boolean>,
  );

  const [bladeActive, setBladeActive] = useState(false);
  // Initialize from the same persisted preference as the Tools panel. The
  // change event alone is not sufficient because the timeline may mount after
  // the event was dispatched by the parent component.
  const [quickAccessVisible, setQuickAccessVisible] = useState(() => {
    try {
      return (window.localStorage.getItem('wallcut-editor-quick-access') ??
          window.localStorage.getItem('finance-shorts-editor-quick-access')) !== 'false';
    } catch {
      return true;
    }
  });
  const [sceneQuickAccessVisible, setSceneQuickAccessVisible] = useState(() => {
    try {
      return window.localStorage.getItem('wallcut-scene-quick-access') !== 'false';
    } catch {
      return true;
    }
  });
  useEffect(() => {
    const handleSceneQuickAccess = (event: Event) =>
      setSceneQuickAccessVisible(Boolean((event as CustomEvent<boolean>).detail));
    window.addEventListener('editor-scene-quick-access-change', handleSceneQuickAccess);
    return () =>
      window.removeEventListener('editor-scene-quick-access-change', handleSceneQuickAccess);
  }, []);
  useEffect(() => {
    const handleQuickAccess = (event: Event) =>
      setQuickAccessVisible(Boolean((event as CustomEvent<boolean>).detail));
    const handleBladeToggle = () => setBladeActive((value) => !value);
    window.addEventListener('editor-quick-access-change', handleQuickAccess);
    window.addEventListener('editor-blade-toggle', handleBladeToggle);
    return () => {
      window.removeEventListener('editor-quick-access-change', handleQuickAccess);
      window.removeEventListener('editor-blade-toggle', handleBladeToggle);
    };
  }, []);

  // Keep the active-tool state available to the Tools panel as well as the timeline toolbar.
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('editor-blade-state', { detail: bladeActive }));
  }, [bladeActive]);

  useEffect(() => {
    const handleBladeShortcut = (event: KeyboardEvent) => {
      // Physical key code supports both Latin and Cyrillic keyboard layouts.
      if (event.code !== 'KeyB' || event.ctrlKey || event.metaKey || event.altKey) {
        return;
      }

      const target = event.target as HTMLElement | null;
      if (
        target?.tagName === 'INPUT' ||
        target?.tagName === 'TEXTAREA' ||
        target?.isContentEditable
      ) {
        return;
      }

      event.preventDefault();
      setBladeActive((value) => !value);
    };

    window.addEventListener('keydown', handleBladeShortcut, true);
    return () => window.removeEventListener('keydown', handleBladeShortcut, true);
  }, []);

  const {
    timelineHeight,
    labelWidth,
    windowWidth,
    handleLabelWidthChange,
    handleTimelineResizeStart,
    handleTimelineResizeMove,
    handleTimelineResizeEnd,
  } = useTimelinePanelSizing();

  const timelineRef = useRef<HTMLDivElement | null>(null);

  const currentFrameDragRef = useRef<{
    pointerId: number;
  } | null>(null);

  const {
    frameWidth,
    frameToX,
    blocksByTrack,
    subTracksByTrack,
    totalTimelineWidth,
    currentFrameX,
    getPointerFrame: getPointerFrameFromModel,
    getSnapCandidates,
  } = useTimelineModel({
    blocks,
    segments,
    durationInFrames,
    currentFrame,
    windowWidth,
    labelWidth,
  });

  const getPointerFrame = useCallback(
    (event: React.PointerEvent) => getPointerFrameFromModel(event, timelineRef.current),
    [getPointerFrameFromModel],
  );

  const handleBladeAudioCut = useCallback(
    (trackId: string, event: React.PointerEvent<HTMLDivElement>) => {
      if (!bladeActive || !onSplitAudio || !timelineRef.current) return;
      const rect = timelineRef.current.getBoundingClientRect();
      const contentX = event.clientX - rect.left - labelWidth + timelineRef.current.scrollLeft;
      const frame = Math.round(contentX / Math.max(1, frameWidth));
      onSplitAudio(trackId, frame);
    },
    [bladeActive, frameWidth, labelWidth, onSplitAudio],
  );

  const stopCurrentFrameDrag = useCallback((pointerId: number) => {
    const drag = currentFrameDragRef.current;

    if (!drag) {
      return;
    }

    if (drag.pointerId !== pointerId) {
      return;
    }

    currentFrameDragRef.current = null;
  }, []);

  const handleCurrentFramePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.button !== 0) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();

      currentFrameDragRef.current = {
        pointerId: event.pointerId,
      };

      const frame = getPointerFrame(event);

      onFrameChange(clamp(frame, 0, durationInFrames));

      const handleWindowMove = (moveEvent: PointerEvent) => {
        const drag = currentFrameDragRef.current;

        if (!drag) {
          return;
        }

        if (moveEvent.pointerId !== drag.pointerId) {
          return;
        }

        /*
         * If the physical mouse button is no
         * longer pressed, stop immediately.
         */
        if (moveEvent.buttons !== 1) {
          stopCurrentFrameDrag(moveEvent.pointerId);

          window.removeEventListener('pointermove', handleWindowMove);

          window.removeEventListener('pointerup', handleWindowUp);

          window.removeEventListener('pointercancel', handleWindowUp);

          return;
        }

        const timeline = timelineRef.current;

        if (!timeline) {
          return;
        }

        const rect = timeline.getBoundingClientRect();

        const contentX = moveEvent.clientX - rect.left - labelWidth + timeline.scrollLeft;

        const frame = contentX / frameWidth;

        onFrameChange(clamp(frame, 0, durationInFrames));
      };

      const handleWindowUp = (upEvent: PointerEvent) => {
        const drag = currentFrameDragRef.current;

        if (!drag) {
          return;
        }

        if (upEvent.pointerId !== drag.pointerId) {
          return;
        }

        stopCurrentFrameDrag(upEvent.pointerId);

        window.removeEventListener('pointermove', handleWindowMove);

        window.removeEventListener('pointerup', handleWindowUp);

        window.removeEventListener('pointercancel', handleWindowUp);
      };

      window.addEventListener('pointermove', handleWindowMove);

      window.addEventListener('pointerup', handleWindowUp);

      window.addEventListener('pointercancel', handleWindowUp);
    },
    [
      durationInFrames,
      frameWidth,
      getPointerFrame,
      labelWidth,
      onFrameChange,
      stopCurrentFrameDrag,
    ],
  );

  const handleTimelinePointerDown = useCallback(
    (event: React.PointerEvent) => {
      if (event.button !== 0) {
        return;
      }

      const target = event.target as HTMLElement;

      /*
       * Do not interfere with:
       *
       * - block dragging
       * - block resizing
       * - timeline resizing
       * - label resizing
       * - direct playhead dragging
       */

      if (
        target.closest('[data-editor-block]') ||
        target.closest('[data-resize-handle]') ||
        target.closest('[data-timeline-resize]') ||
        target.closest('[data-timeline-label-resize]') ||
        target.closest('[data-current-frame]')
      ) {
        return;
      }

      handleCurrentFramePointerDown(event as React.PointerEvent<HTMLDivElement>);
    },
    [handleCurrentFramePointerDown],
  );

  const blockInteraction = useTimelineBlockInteraction({
    blocks,
    segments,
    durationInFrames,
    timelineRef,
    getPointerFrame,
    getSnapCandidates,
    onSelect,
    onMoveBlock,
    onResizeBlock,
    onChangeBlockLayer,
    onInteractionStart,
    onInteractionEnd,
  });
  const {
    draggingId,
    dropTrackId,
    dropSceneId,
    beginBlockInteraction,
    updateBlockInteraction,
    endBlockInteraction,
    suppressNextBlockClickRef,
  } = blockInteraction;

  const toggleTrack = useCallback((trackId: TrackId) => {
    setCollapsed((previous) => ({
      ...previous,
      [trackId]: !previous[trackId],
    }));
  }, []);

  const segmentBoundaries = useMemo(() => {
    const boundaries: number[] = [];

    for (const segment of segments) {
      boundaries.push(segment.startFrame);

      boundaries.push(segment.startFrame + segment.durationFrames);
    }

    return Array.from(new Set(boundaries)).filter(
      (frame) => frame >= 0 && frame <= durationInFrames,
    );
  }, [durationInFrames, segments]);

  return (
    <>
      <SceneStrip
        visible={sceneQuickAccessVisible}
        segments={segments}
        fps={fps}
        selectedSceneId={selectedSceneId}
        dropSceneId={dropSceneId}
        onSceneSelect={onSceneSelect}
        onFrameChange={onFrameChange}
        onSceneAdd={onSceneAdd}
        onSceneReorder={onSceneReorder}
        onSceneDuplicate={onSceneDuplicate}
        onSceneDelete={onSceneDelete}
        onSceneDurationChange={onSceneDurationChange}
      />

      {quickAccessVisible && (
        <TimelineToolbar
          bladeActive={bladeActive}
          onBladeToggle={() => setBladeActive((value) => !value)}
        />
      )}

      <TimelineView
        timelineHeight={timelineHeight}
        timelineRef={timelineRef}
        totalTimelineWidth={totalTimelineWidth}
        durationInFrames={durationInFrames}
        fps={fps}
        timeline={timeline}
        frameWidth={frameWidth}
        frameToX={frameToX}
        currentFrameX={currentFrameX}
        labelWidth={labelWidth}
        onLabelWidthChange={handleLabelWidthChange}
        segmentBoundaries={segmentBoundaries}
        blocksByTrack={blocksByTrack}
        subTracksByTrack={subTracksByTrack}
        collapsed={collapsed}
        draggingId={draggingId}
        dropTrackId={dropTrackId}
        selectedBlockId={selectedBlockId}
        onSelect={(id) => {
          if (suppressNextBlockClickRef.current) {
            suppressNextBlockClickRef.current = false;
            return;
          }
          onSelect(id);
        }}
        bladeActive={bladeActive}
        onBladeAudioCut={handleBladeAudioCut}
        onCurrentFramePointerDown={handleCurrentFramePointerDown}
        onTimelinePointerDown={handleTimelinePointerDown}
        onResizeStart={handleTimelineResizeStart}
        onResizeMove={handleTimelineResizeMove}
        onResizeEnd={handleTimelineResizeEnd}
        onToggleTrack={toggleTrack}
        onBlockPointerDown={beginBlockInteraction}
        onBlockPointerMove={updateBlockInteraction}
        onBlockPointerUp={endBlockInteraction}
        audioTracks={audioTracks}
        onAudioStateChange={onAudioStateChange}
        onAudioAdd={onAudioAdd}
        audioSelectedId={audioSelectedId}
        onAudioSelect={onAudioSelect}
        onAudioContextMenu={onAudioContextMenu}
        onAudioScrub={handleTimelinePointerDown}
      />
    </>
  );
};
