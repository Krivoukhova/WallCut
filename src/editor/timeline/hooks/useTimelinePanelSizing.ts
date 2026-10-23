import { useCallback, useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';

import {
  BASE_TIMELINE_HEIGHT,
  MIN_TIMELINE_HEIGHT,
  MAX_TIMELINE_HEIGHT,
} from '../timelineConstants';
import { clamp } from '../timelineUtils';

const MIN_LABEL_WIDTH = 100;
const MAX_LABEL_WIDTH = 350;
const DEFAULT_LABEL_WIDTH = 150;

/** Owns the timeline panel's dimensions and pointer-driven resizing. */
export function useTimelinePanelSizing() {
  const [timelineHeight, setTimelineHeight] = useState(BASE_TIMELINE_HEIGHT);
  const [labelWidth, setLabelWidth] = useState(DEFAULT_LABEL_WIDTH);
  const [windowWidth, setWindowWidth] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth : 1200,
  );

  const timelineResizeRef = useRef<{ startY: number; startHeight: number } | null>(null);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleTimelineResizeStart = useCallback(
    (event: ReactPointerEvent) => {
      event.preventDefault();
      event.stopPropagation();
      timelineResizeRef.current = {
        startY: event.clientY,
        startHeight: timelineHeight,
      };
      try {
        (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
      } catch {
        // Pointer capture is not available in every environment.
      }
    },
    [timelineHeight],
  );

  const handleTimelineResizeMove = useCallback((event: ReactPointerEvent) => {
    const resize = timelineResizeRef.current;
    if (!resize) return;

    const delta = resize.startY - event.clientY;
    setTimelineHeight(clamp(resize.startHeight + delta, MIN_TIMELINE_HEIGHT, MAX_TIMELINE_HEIGHT));
  }, []);

  const handleTimelineResizeEnd = useCallback((event: ReactPointerEvent) => {
    if (!timelineResizeRef.current) return;
    timelineResizeRef.current = null;
    try {
      const target = event.currentTarget as HTMLElement;
      if (target.hasPointerCapture(event.pointerId)) {
        target.releasePointerCapture(event.pointerId);
      }
    } catch {
      // Pointer capture may already have been released.
    }
  }, []);

  const handleLabelWidthChange = useCallback((width: number) => {
    setLabelWidth(clamp(width, MIN_LABEL_WIDTH, MAX_LABEL_WIDTH));
  }, []);

  return {
    timelineHeight,
    labelWidth,
    windowWidth,
    handleLabelWidthChange,
    handleTimelineResizeStart,
    handleTimelineResizeMove,
    handleTimelineResizeEnd,
  };
}
