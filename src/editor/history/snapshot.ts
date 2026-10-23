import type { VisualTimelineData } from '../../domain/timeline/visualTimelineTypes';

/** Create an isolated history snapshot without relying on JSON serialization. */
export function cloneTimelineSnapshot(timeline: VisualTimelineData): VisualTimelineData {
  return structuredClone(timeline);
}

/**
 * Structural equality used only when closing an editor transaction.
 * This intentionally avoids serializing the entire document to JSON.
 */
export function timelinesEqual(a: VisualTimelineData, b: VisualTimelineData): boolean {
  return deepEqual(a, b);
}

function deepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== typeof b || a === null || b === null) return false;

  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
    for (let i = 0; i < a.length; i += 1) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }

  if (typeof a !== 'object' || typeof b !== 'object') return false;

  const ak = Object.keys(a as Record<string, unknown>);
  const bk = Object.keys(b as Record<string, unknown>);
  if (ak.length !== bk.length) return false;

  for (const key of ak) {
    if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
    if (!deepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key]))
      return false;
  }
  return true;
}
