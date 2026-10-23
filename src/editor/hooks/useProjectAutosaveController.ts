import { useEffect, useRef, useState } from 'react';

import {
  createAutosaveController,
  type AutosaveController,
  type AutosaveStatus,
} from '../../application/autosave/AutosaveController';

/** Owns the autosave queue lifecycle and browser lifecycle flushes for the editor. */
export function useProjectAutosaveController(onError: (error: unknown) => void) {
  const [autosaveStatus, setAutosaveStatus] = useState<AutosaveStatus>('idle');
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  const controllerRef = useRef<AutosaveController | null>(null);
  if (!controllerRef.current) {
    controllerRef.current = createAutosaveController({
      delayMs: 800,
      onStatusChange: setAutosaveStatus,
      onError: (error) => onErrorRef.current(error),
    });
  }
  const autosaveController = controllerRef.current;

  useEffect(() => {
    const flush = () => {
      void autosaveController.flush().catch(() => undefined);
    };
    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') flush();
    };

    window.addEventListener('pagehide', flush);
    window.addEventListener('beforeunload', flush);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('pagehide', flush);
      window.removeEventListener('beforeunload', flush);
      document.removeEventListener('visibilitychange', handleVisibility);
      // Flush instead of disposing here: React Strict Mode replays effect cleanup/setup
      // in development, and the same controller instance must remain reusable.
      void autosaveController.flush().catch(() => undefined);
    };
  }, [autosaveController]);

  return { autosaveController, autosaveStatus };
}
