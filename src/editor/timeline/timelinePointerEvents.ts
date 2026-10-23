/**
 * Returns true when a native pointer event was already processed by React's
 * block handler. Removing it here prevents the window fallback from applying
 * the same move/end operation twice.
 */
export function consumeHandledPointerEvent(event: Event, handledEvents: WeakSet<Event>): boolean {
  if (!handledEvents.has(event)) {
    return false;
  }

  handledEvents.delete(event);
  return true;
}
