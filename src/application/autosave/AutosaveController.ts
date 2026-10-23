export type AutosaveStatus = 'idle' | 'scheduled' | 'saving' | 'error';

export type AutosaveControllerOptions = {
  delayMs?: number;
  onStatusChange?: (status: AutosaveStatus) => void;
  onError?: (error: unknown) => void;
};

export type AutosaveController = {
  schedule(save: () => Promise<void>): void;
  flush(): Promise<void>;
  cancel(): void;
  dispose(): void;
  getStatus(): AutosaveStatus;
};

/**
 * Application-level autosave coordinator.
 * It knows nothing about React, IndexedDB, or the project shape.
 */
export function createAutosaveController(
  options: AutosaveControllerOptions = {},
): AutosaveController {
  const delayMs = options.delayMs ?? 800;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let pendingSave: (() => Promise<void>) | null = null;
  let inFlight: Promise<void> | null = null;
  let status: AutosaveStatus = 'idle';
  let disposed = false;

  const setStatus = (next: AutosaveStatus) => {
    status = next;
    options.onStatusChange?.(next);
  };

  const run = async (): Promise<void> => {
    if (disposed || !pendingSave || inFlight) return inFlight ?? Promise.resolve();

    const save = pendingSave;
    pendingSave = null;
    setStatus('saving');

    inFlight = Promise.resolve()
      .then(save)
      .then(() => {
        setStatus(pendingSave ? 'scheduled' : 'idle');
      })
      .catch((error) => {
        setStatus('error');
        options.onError?.(error);
        throw error;
      })
      .finally(() => {
        inFlight = null;
        if (pendingSave && !disposed) {
          void run().catch(() => undefined);
        }
      });

    return inFlight;
  };

  const schedule = (save: () => Promise<void>) => {
    if (disposed) return;
    pendingSave = save;
    if (timer) clearTimeout(timer);
    setStatus('scheduled');
    timer = setTimeout(() => {
      timer = null;
      void run().catch(() => undefined);
    }, delayMs);
  };

  const flush = async () => {
    if (disposed) return;
    if (timer) {
      clearTimeout(timer);
      timer = null;
    }

    let lastError: unknown = null;
    while (inFlight || pendingSave) {
      if (inFlight) {
        const current = inFlight;
        try {
          await current;
        } catch (error) {
          lastError = error;
        }
        continue;
      }
      try {
        await run();
      } catch (error) {
        lastError = error;
      }
    }

    if (lastError) throw lastError;
  };

  const cancel = () => {
    if (timer) clearTimeout(timer);
    timer = null;
    pendingSave = null;
    if (!inFlight) setStatus('idle');
  };

  const dispose = () => {
    disposed = true;
    cancel();
  };

  return {
    schedule,
    flush,
    cancel,
    dispose,
    getStatus: () => status,
  };
}
