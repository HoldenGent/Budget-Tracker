import { useFinance } from "../context/FinanceContext";

export function useTransactions() {
  const { transactions, addTransaction, deleteTransaction } = useFinance();
  return { transactions, addTransaction, deleteTransaction };
}
