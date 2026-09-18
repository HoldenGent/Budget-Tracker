import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";

import { migrateAccounts } from "../utils/accounts";
import type { Account } from "../types/Account";
import type { Transaction } from "../types/Transactions";

const ACCOUNTS_STORAGE_KEY = "budget-tracker-accounts";
const TRANSACTIONS_STORAGE_KEY = "budget-tracker-transactions";

interface FinanceContextValue {
  accounts: Account[];
  transactions: Transaction[];
  addAccount: (account: Account) => void;
  updateAccount: (account: Account) => void;
  deleteAccount: (accountId: string) => void;
  addTransaction: (transaction: Transaction) => void;
  deleteTransaction: (transactionId: string) => void;
  updateTransaction: (transaction: Transaction) => void;
}

interface FinanceProviderProps {
  children: ReactNode;
}

const FinanceContext = createContext<FinanceContextValue | undefined>(
  undefined,
);

function loadFromLocalStorage<T>(
  key: string,
  fallbackValue: T,
): T {
  const savedValue = localStorage.getItem(key);

  if (!savedValue) {
    return fallbackValue;
  }

  try {
    return JSON.parse(savedValue) as T;
  } catch {
    return fallbackValue;
  }
}

export function FinanceProvider({
  children,
}: FinanceProviderProps) {
  const [accounts, setAccounts] = useState<Account[]>(() =>
    migrateAccounts(loadFromLocalStorage(ACCOUNTS_STORAGE_KEY, [])),
  );

  const [transactions, setTransactions] = useState<
    Transaction[]
  >(() =>
    loadFromLocalStorage<Transaction[]>(
      TRANSACTIONS_STORAGE_KEY,
      [],
    ),
  );

  useEffect(() => {
    localStorage.setItem(
      ACCOUNTS_STORAGE_KEY,
      JSON.stringify(accounts),
    );
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem(
      TRANSACTIONS_STORAGE_KEY,
      JSON.stringify(transactions),
    );
  }, [transactions]);

  function addAccount(account: Account) {
    setAccounts((currentAccounts) => [
      ...currentAccounts,
      account,
    ]);
  }

  function updateAccount(updated: Account) {
    setAccounts((current) => current.map((account) =>
      account.id === updated.id ? updated : account,
    ));
  }

  function deleteAccount(accountId: string) {
    setAccounts((currentAccounts) =>
      currentAccounts.filter(
        (account) => account.id !== accountId,
      ),
    );

    setTransactions((currentTransactions) =>
      currentTransactions.filter(
        (transaction) =>
          transaction.accountId !== accountId,
      ),
    );
  }

  function addTransaction(transaction: Transaction) {
    setTransactions((currentTransactions) => [
      ...currentTransactions,
      transaction,
    ]);
  }

  function updateTransaction(updated: Transaction) {
    setTransactions((current) => current.map((transaction) =>
      transaction.id === updated.id ? updated : transaction,
    ));
  }

  function deleteTransaction(transactionId: string) {
    setTransactions((currentTransactions) =>
      currentTransactions.filter(
        (transaction) =>
          transaction.id !== transactionId,
      ),
    );
  }

  const value = useMemo(
    () => ({
      accounts,
      transactions,
      addAccount,
      updateAccount,
      deleteAccount,
      addTransaction,
      deleteTransaction,
      updateTransaction,
    }),
    [accounts, transactions],
  );

  return (
    <FinanceContext.Provider value={value}>
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance(): FinanceContextValue {
  const context = useContext(FinanceContext);

  if (context === undefined) {
    throw new Error(
      "useFinance must be used inside a FinanceProvider.",
    );
  }

  return context;
}