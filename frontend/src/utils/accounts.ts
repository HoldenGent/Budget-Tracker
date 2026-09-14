import type { Account } from "../types/Account";
import type { Transaction } from "../types/Transactions";

export function calculateAccountBalance(
  account: Account,
  transactions: Transaction[],
): number {
  return transactions
    .filter(
      (transaction) => transaction.accountId === account.id,
    )
    .reduce((balance, transaction) => {
      if (transaction.type === "Income") {
        return balance + transaction.amount;
      }

      return balance - transaction.amount;
    }, account.startingBalance);
}
// Older versions persisted the opening balance under `balance`.
// Prefer startingBalance when both fields exist, including when it is zero.
export function migrateAccounts(value: unknown): Account[] {
  if (!Array.isArray(value)) return [];

  return value.map((account) => {
    if (
      account &&
      typeof account === "object" &&
      !("startingBalance" in account) &&
      typeof account.balance === "number" &&
      Number.isFinite(account.balance)
    ) {
      const { balance, ...rest } = account;
      return { ...rest, startingBalance: balance };
    }
    return account;
  });
}
