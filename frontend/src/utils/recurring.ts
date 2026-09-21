import type { Transaction } from '../types/Transactions';
import type { RecurringTransaction, Frequency } from '../types/RecurringTransaction';

export function localDate(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function isCalendarDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00`);
  return Number.isFinite(date.getTime()) && localDate(date) === value;
}

// Keep the original day/month as the anchor so February doesn't shift March.
export function nextDate(current: string, anchor: string, frequency: Frequency): string {
  const date = new Date(`${current}T12:00:00`);
  const start = new Date(`${anchor}T12:00:00`);
  if (frequency === 'Weekly') {
    date.setDate(date.getDate() + 7);
  } else {
    const year = date.getFullYear() + (frequency === 'Yearly' ? 1 : 0);
    const month = frequency === 'Yearly' ? start.getMonth() : date.getMonth() + 1;
    const lastDay = new Date(year, month + 1, 0, 12).getDate();
    date.setDate(1);
    date.setFullYear(year, month, Math.min(start.getDate(), lastDay));
  }
  return localDate(date);
}

export interface TransactionLedger {
  transactions: Transaction[];
  schedules: RecurringTransaction[];
}

export function catchUp(ledger: TransactionLedger, today: string): TransactionLedger {
  const transactions = [...ledger.transactions];
  const ids = new Set(transactions.map((transaction) => transaction.id));
  let changed = false;
  const schedules = ledger.schedules.map((schedule) => {
    let due = schedule.nextDueDate;
    if (!isCalendarDate(due) || !isCalendarDate(schedule.startDate) ||
        !['Weekly', 'Monthly', 'Yearly'].includes(schedule.frequency)) return schedule;
    while (due <= today) {
      const id = `recurring:${schedule.id}:${due}`;
      if (!ids.has(id)) {
        transactions.push({ id, accountId: schedule.accountId, description: schedule.description,
          amount: schedule.amount, type: schedule.type, category: schedule.category, date: due });
        ids.add(id);
      }
      due = nextDate(due, schedule.startDate, schedule.frequency);
      changed = true;
    }
    return due === schedule.nextDueDate ? schedule : { ...schedule, nextDueDate: due };
  });
  return changed ? { transactions, schedules } : ledger;
}
