import { useFinance } from "../context/FinanceContext";

export function useAccounts() {
  const { accounts, addAccount, deleteAccount } = useFinance();
  return { accounts, addAccount, deleteAccount };
}
