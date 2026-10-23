import type React from 'react';
import { useEffect } from 'react';
import type { InteractionState } from '../timelineTypes';

type CurrentRef<T> = { current: T };

import { consumeHandledPointerEvent } from '../timelinePointerEvents';

/**
 * Continues an active interaction if a scene transfer replaces the captured
 * DOM node and pointer capture is consequently lost.
 */
export function useTimelineWindowPointerFallback(
  interactionRef: CurrentRef<InteractionState | null>,
  handledPointerEventsRef: CurrentRef<WeakSet<Event>>,
  updateBlockInteraction: (event: React.PointerEvent) => void,
  endBlockInteraction: (event: React.PointerEvent) => void,
): void {
  useEffect(() => {
    const handleWindowPointerMove = (event: PointerEvent) => {
      if (consumeHandledPointerEvent(event, handledPointerEventsRef.current)) {
        return;
      }
      if (!interactionRef.current) return;
      updateBlockInteraction(event as unknown as React.PointerEvent);
    };

    const handleWindowPointerEnd = (event: PointerEvent) => {
      if (consumeHandledPointerEvent(event, handledPointerEventsRef.current)) {
        return;
      }
      if (!interactionRef.current) return;
      endBlockInteraction(event as unknown as React.PointerEvent);
    };

    window.addEventListener('pointermove', handleWindowPointerMove);
    window.addEventListener('pointerup', handleWindowPointerEnd);
    window.addEventListener('pointercancel', handleWindowPointerEnd);
    return () => {
      window.removeEventListener('pointermove', handleWindowPointerMove);
      window.removeEventListener('pointerup', handleWindowPointerEnd);
      window.removeEventListener('pointercancel', handleWindowPointerEnd);
    };
  }, [interactionRef, handledPointerEventsRef, updateBlockInteraction, endBlockInteraction]);
}
