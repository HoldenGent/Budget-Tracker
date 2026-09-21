import type { Transaction } from './Transactions';

export type Frequency = 'Weekly' | 'Monthly' | 'Yearly';
export interface RecurringTransaction extends Omit<Transaction, 'date'> {
  frequency: Frequency;
  startDate: string;
  nextDueDate: string;
}
