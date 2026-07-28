export type AccountType =
  | "checking"
  | "savings"
  | "credit_card"
  | "cash";

export type TransactionType =
  | "income"
  | "expense"
  | "transfer";

export type TransactionSource =
  | "manual"
  | "recurring"
  | "csv_import"
  | "bank_sync";

export interface Account {
  id: number;
  name: string;
  accountType: AccountType;
  startingBalance: number;
  currentBalance: number;
}

export interface Category {
  id: number;
  name: string;
  categoryType: "income" | "expense" | "transfer";
}

export interface Transaction {
  id: number;
  accountId: number;
  categoryId: number | null;
  amount: number;
  transactionType: TransactionType;
  transactionDate: string;
  description: string;
  notes: string | null;
  source: TransactionSource;
}

export interface Budget {
  id: number;
  categoryId: number;
  amount: number;
  month: string;
}