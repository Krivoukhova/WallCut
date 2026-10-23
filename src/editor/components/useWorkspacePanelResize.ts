import { useCallback, useEffect, useRef, useState } from 'react';
import type React from 'react';

export const MIN_LIBRARY_WIDTH = 180;
export const MAX_LIBRARY_WIDTH = 420;
const DEFAULT_LIBRARY_WIDTH = 180;
export const MIN_INSPECTOR_WIDTH = 220;
const MAX_INSPECTOR_WIDTH = 440;
const DEFAULT_INSPECTOR_WIDTH = 280;

/** Owns the pointer-drag behavior and cleanup for the workspace side panels. */
export function useWorkspacePanelResize() {
  const [libraryWidth, setLibraryWidth] = useState(DEFAULT_LIBRARY_WIDTH);
  const [inspectorWidth, setInspectorWidth] = useState(DEFAULT_INSPECTOR_WIDTH);
  const libraryResizeState = useRef<{ pointerStartX: number; initialWidth: number } | null>(null);
  const inspectorResizeState = useRef<{ pointerStartX: number; initialWidth: number } | null>(null);

  const handleResizePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      event.currentTarget.setPointerCapture(event.pointerId);
      libraryResizeState.current = { pointerStartX: event.clientX, initialWidth: libraryWidth };
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    },
    [libraryWidth],
  );

  const handleResizePointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const state = libraryResizeState.current;
    if (!state) return;

    const delta = event.clientX - state.pointerStartX;
    const nextWidth = Math.max(
      MIN_LIBRARY_WIDTH,
      Math.min(MAX_LIBRARY_WIDTH, state.initialWidth + delta),
    );
    setLibraryWidth(nextWidth);
  }, []);

  const finishResize = useCallback((event?: React.PointerEvent<HTMLDivElement>) => {
    if (!libraryResizeState.current) return;
    if (event && event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    libraryResizeState.current = null;
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  const handleInspectorResizePointerDown = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      event.currentTarget.setPointerCapture(event.pointerId);
      inspectorResizeState.current = { pointerStartX: event.clientX, initialWidth: inspectorWidth };
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    },
    [inspectorWidth],
  );

  const handleInspectorResizePointerMove = useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    const state = inspectorResizeState.current;
    if (!state) return;

    // Dragging the divider left widens the inspector; dragging right narrows it.
    const nextWidth = Math.max(
      MIN_INSPECTOR_WIDTH,
      Math.min(MAX_INSPECTOR_WIDTH, state.initialWidth + state.pointerStartX - event.clientX),
    );
    setInspectorWidth(nextWidth);
  }, []);

  const finishInspectorResize = useCallback((event?: React.PointerEvent<HTMLDivElement>) => {
    if (!inspectorResizeState.current) return;
    inspectorResizeState.current = null;
    if (event && event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }, []);

  useEffect(() => {
    return () => {
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, []);

  return {
    libraryWidth,
    inspectorWidth,
    handleResizePointerDown,
    handleResizePointerMove,
    finishResize,
    handleInspectorResizePointerDown,
    handleInspectorResizePointerMove,
    finishInspectorResize,
  };
}
