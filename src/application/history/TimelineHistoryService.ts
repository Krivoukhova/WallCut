import type { TimelineCommand } from '../commands/TimelineCommand';
import { executeEditorCommand } from '../editor/EditorCommandExecutor';
import { TransactionManager } from '../transactions/TransactionManager';
import type { VisualTimelineData } from '../../domain/timeline/visualTimelineTypes';
import type { CloneService } from '../runtime/runtimeServices';

export type EditorTransactionType = 'interaction' | 'text' | 'inspector' | 'color';

type TimelineTransactionManager = TransactionManager<VisualTimelineData, EditorTransactionType>;

function timelinesEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (typeof a !== typeof b || a === null || b === null) return false;

  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
    for (let i = 0; i < a.length; i += 1) {
      if (!timelinesEqual(a[i], b[i])) return false;
    }
    return true;
  }

  if (typeof a !== 'object' || typeof b !== 'object') return false;

  const ak = Object.keys(a as Record<string, unknown>);
  const bk = Object.keys(b as Record<string, unknown>);
  if (ak.length !== bk.length) return false;

  for (const key of ak) {
    if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
    if (!timelinesEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key]))
      return false;
  }

  return true;
}

/**
 * Application-level history service.
 *
 * Owns timeline mutation history and transaction boundaries, but has no
 * knowledge of React, Remotion, IndexedDB or browser UI state.
 */
export class TimelineHistoryService {
  private current: VisualTimelineData;
  private readonly undoStack: VisualTimelineData[] = [];
  private readonly redoStack: VisualTimelineData[] = [];
  private readonly transactions: TimelineTransactionManager;

  constructor(
    initialTimeline: VisualTimelineData,
    private readonly clone: CloneService,
  ) {
    this.current = initialTimeline;
    this.transactions = new TransactionManager();
  }

  get timeline(): VisualTimelineData {
    return this.current;
  }

  get activeTransactionType(): EditorTransactionType | null {
    return this.transactions.current?.type ?? null;
  }

  get canUndo(): boolean {
    return this.undoStack.length > 0 || this.transactions.current !== null;
  }

  get canRedo(): boolean {
    return this.redoStack.length > 0;
  }

  execute(command: TimelineCommand): boolean {
    const previous = this.current;
    const next = executeEditorCommand(previous, command);

    if (next === previous || timelinesEqual(previous, next)) {
      return false;
    }

    this.current = next;

    if (this.transactions.current) {
      return true;
    }

    this.undoStack.push(this.clone.clone(previous));
    this.redoStack.length = 0;
    return true;
  }

  beginTransaction(type: EditorTransactionType): void {
    const active = this.transactions.current;

    if (active) {
      if (active.type === type) return;
      this.commitTransaction();
    }

    this.transactions.begin(type, this.clone.clone(this.current));
  }

  commitTransaction(): boolean {
    const transaction = this.transactions.clear();
    if (!transaction) return false;

    if (timelinesEqual(transaction.before, this.current)) {
      return false;
    }

    this.undoStack.push(this.clone.clone(transaction.before));
    this.redoStack.length = 0;
    return true;
  }

  commitColorEdit(): boolean {
    if (this.transactions.current?.type !== 'color') return false;
    return this.commitTransaction();
  }

  beginColorEdit(): void {
    if (this.transactions.current?.type === 'color') {
      this.commitColorEdit();
    }
    this.beginTransaction('color');
  }

  undo(): VisualTimelineData | null {
    if (this.transactions.current) {
      this.commitTransaction();
    }

    const previous = this.undoStack.pop();
    if (!previous) return null;

    this.redoStack.push(this.clone.clone(this.current));
    this.current = previous;
    return this.current;
  }

  redo(): VisualTimelineData | null {
    if (this.transactions.current) {
      this.commitTransaction();
    }

    const next = this.redoStack.pop();
    if (!next) return null;

    this.undoStack.push(this.clone.clone(this.current));
    this.current = next;
    return this.current;
  }
}
