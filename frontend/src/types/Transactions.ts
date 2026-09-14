
export type TransactionType = "Income" | "Expense";

export interface Transaction {
  id: string;
  accountId: string;
  description: string;
  amount: number;
  type: TransactionType;
  date: string;
  category: string; // TODO: create Category module
}