import { assertEqual } from './testUtils';
import { createTimelineCommand } from '../../application/commands/TimelineCommand';
import { TransactionManager } from '../../application/transactions/TransactionManager';

export function runCommandInvariantTests(): void {
  const command = createTimelineCommand({
    id: 'test.increment',
    label: 'Increment',
    execute: (timeline) => timeline,
  });

  assertEqual(command.id, 'test.increment', 'commands expose stable identifiers');

  const transactions = new TransactionManager<number, 'interaction' | 'text'>();

  assertEqual(
    transactions.current,
    null,
    'transaction manager starts without an active transaction',
  );

  transactions.begin('interaction', 10);

  assertEqual(transactions.current?.before, 10, 'transaction captures the before snapshot');

  transactions.clear();

  assertEqual(transactions.current, null, 'clear closes the active transaction');
}
