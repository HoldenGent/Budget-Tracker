export type AccountType =
  | "Checking"
  | "Savings"
  | "Credit Card"
  | "Cash";

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  startingBalance: number;
}