export type ActiveTransaction<T, Kind extends string = string> = {
  readonly type: Kind;
  readonly before: T;
};

/**
 * Framework-agnostic transaction lifecycle.
 *
 * History decides what a committed snapshot means; this class only owns
 * the lifecycle of the active transaction.
 */
export class TransactionManager<T, Kind extends string = string> {
  private active: ActiveTransaction<T, Kind> | null = null;

  get current(): ActiveTransaction<T, Kind> | null {
    return this.active;
  }

  begin(type: Kind, before: T): ActiveTransaction<T, Kind> | null {
    const previous = this.active;
    this.active = { type, before };
    return previous;
  }

  clear(): ActiveTransaction<T, Kind> | null {
    const previous = this.active;
    this.active = null;
    return previous;
  }
}
