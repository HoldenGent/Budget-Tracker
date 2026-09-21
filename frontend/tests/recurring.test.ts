import { describe, expect, it } from 'vitest';
import { catchUp, localDate, nextDate } from '../src/utils/recurring';
import type { RecurringTransaction } from '../src/types/RecurringTransaction';

const schedule: RecurringTransaction = {
  id: 'rent', accountId: 'checking', description: 'Rent', amount: 100,
  type: 'Expense', category: 'Housing', frequency: 'Monthly',
  startDate: '2024-01-31', nextDueDate: '2024-01-31',
};

describe('recurring calendar dates', () => {
  it('clamps month ends without losing the original day', () => {
    expect(nextDate('2024-01-31', '2024-01-31', 'Monthly')).toBe('2024-02-29');
    expect(nextDate('2024-02-29', '2024-01-31', 'Monthly')).toBe('2024-03-31');
    expect(nextDate('2025-01-31', '2024-01-31', 'Monthly')).toBe('2025-02-28');
    expect(nextDate('2024-12-31', '2024-01-31', 'Monthly')).toBe('2025-01-31');
  });
  it('restores leap day in leap years', () => {
    expect(nextDate('2024-02-29', '2024-02-29', 'Yearly')).toBe('2025-02-28');
    expect(nextDate('2027-02-28', '2024-02-29', 'Yearly')).toBe('2028-02-29');
  });
  it('advances weekly across months and years', () => {
    expect(nextDate('2024-12-28', '2024-12-28', 'Weekly')).toBe('2025-01-04');
    expect(nextDate('2026-03-07', '2026-03-07', 'Weekly')).toBe('2026-03-14');
  });
  it('uses local calendar components', () => {
    expect(localDate(new Date(2026, 8, 21, 23, 59))).toBe('2026-09-21');
  });
});

it('catches up due occurrences only and is idempotent', () => {
  const result = catchUp({ transactions: [], schedules: [schedule] }, '2024-03-31');
  expect(result.transactions.map((t) => t.date)).toEqual(['2024-01-31', '2024-02-29', '2024-03-31']);
  expect(result.schedules[0].nextDueDate).toBe('2024-04-30');
  expect(catchUp(result, '2024-03-31')).toBe(result);
  const deleted = { ...result, transactions: [] };
  expect(catchUp(deleted, '2024-03-31').transactions).toEqual([]);
});

it('does not duplicate an existing occurrence even with an old schedule cursor', () => {
  const first = catchUp({ transactions: [], schedules: [schedule] }, '2024-01-31');
  const retried = catchUp({ transactions: first.transactions, schedules: [schedule] }, '2024-01-31');
  expect(retried.transactions).toHaveLength(1);
});

it('keeps future schedules out of transaction balances', () => {
  expect(catchUp({ transactions: [], schedules: [schedule] }, '2024-01-30').transactions).toEqual([]);
});
