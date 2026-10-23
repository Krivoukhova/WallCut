/**
 * Application-level command.
 *
 * Commands contain editor intent, not React/DOM/Remotion concerns.
 * They are deterministic transformations of a domain state.
 */
export type EditorCommand<State> = {
  readonly id: string;
  readonly label: string;
  execute: (state: State) => State;
};

export function createCommand<State>(options: {
  id: string;
  label: string;
  execute: (state: State) => State;
}): EditorCommand<State> {
  return {
    id: options.id,
    label: options.label,
    execute: options.execute,
  };
}
