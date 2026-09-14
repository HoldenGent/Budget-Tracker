import { describe, expect, it } from 'vitest';
import { calculateAccountBalance, migrateAccounts } from '../src/utils/accounts';
import type { Account } from '../src/types/Account';
import type { Transaction } from '../src/types/Transactions';

const account: Account = { id: 'checking', name: 'Checking', type: 'Checking', startingBalance: 1000 };
const transaction = (type: Transaction['type'], amount: number, accountId = account.id): Transaction => ({
  id: `${type}-${accountId}`, accountId, type, amount,
  description: 'Test', date: '2026-09-14', category: 'Other',
});

describe('account balances', () => {
  it('uses the opening balance without transactions', () => {
    expect(calculateAccountBalance(account, [])).toBe(1000);
  });
  it('adds income, subtracts expenses, and ignores other accounts', () => {
    expect(calculateAccountBalance(account, [
      transaction('Income', 50), transaction('Expense', 125.5), transaction('Expense', 999, 'other'),
    ])).toBe(924.5);
  });
  it('allows expenses to take the balance below zero', () => {
    expect(calculateAccountBalance(account, [transaction('Expense', 1100)])).toBe(-100);
  });
});

describe('saved account migration', () => {
  const legacy = { id: 'old', name: 'Old savings', type: 'Savings', balance: 250 };
  it('preserves account details and converts the old balance field', () => {
    expect(migrateAccounts([legacy])).toEqual([
      { id: 'old', name: 'Old savings', type: 'Savings', startingBalance: 250 },
    ]);
    expect(legacy.balance).toBe(250);
  });
  it('preserves modern accounts, including a zero opening balance', () => {
    expect(migrateAccounts([account, { ...legacy, startingBalance: 0 }])).toEqual([
      account, { ...legacy, startingBalance: 0 },
    ]);
  });
  it('can run repeatedly without changing the balance', () => {
    const migrated = migrateAccounts([legacy]);
    expect(migrateAccounts(migrated)).toEqual(migrated);
  });
  it.each([null, {}, 'invalid'])('handles a non-array saved value: %j', (value) => {
    expect(migrateAccounts(value)).toEqual([]);
  });
});
