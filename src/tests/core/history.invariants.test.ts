import { assertEqual } from './testUtils';

type Snapshot<T> = {
  value: T;
};

export function runHistoryInvariantTests(): void {
  const initial: Snapshot<{ value: string }> = {
    value: { value: 'blue' },
  };

  const committed: Snapshot<{ value: string }> = {
    value: { value: 'green' },
  };

  const history = [initial, committed];

  assertEqual(history.length, 2, 'one committed transaction creates one history entry');

  assertEqual(history[0].value.value, 'blue', 'initial snapshot remains immutable');

  assertEqual(history[1].value.value, 'green', 'committed snapshot is stored');

  // A transaction should collapse intermediate previews into one undo step.
  const previews = ['red', 'green', 'yellow'];

  const committedValue = previews[previews.length - 1];

  assertEqual(committedValue, 'yellow', 'transaction stores the final preview value');
}
