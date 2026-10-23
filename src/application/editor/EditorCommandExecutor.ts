import type { EditorCommand } from '../commands/EditorCommand';

/** Small application service used by the editor adapters. */
export function executeEditorCommand<State>(state: State, command: EditorCommand<State>): State {
  return command.execute(state);
}
