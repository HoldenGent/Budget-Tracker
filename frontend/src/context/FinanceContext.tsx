import { catchUp, localDate } from "../utils/recurring";
import type { TransactionLedger } from "../utils/recurring";
import type { Frequency, RecurringTransaction } from "../types/RecurringTransaction";
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

const LEDGER_STORAGE_KEY = "budget-tracker-ledger";

interface FinanceContextValue {
  schedules: RecurringTransaction[];
  addRecurringTransaction: (transaction: Transaction, frequency: Frequency) => void;
  convertToRecurring: (transaction: Transaction, frequency: Frequency) => void;
  stopRecurringTransaction: (id: string) => void;
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

  const [ledger, setLedger] = useState<TransactionLedger>(() => {
    const saved = loadFromLocalStorage<TransactionLedger | null>(LEDGER_STORAGE_KEY, null);
    return catchUp(saved && Array.isArray(saved.transactions) && Array.isArray(saved.schedules)
      ? saved
      : { transactions: loadFromLocalStorage<Transaction[]>(TRANSACTIONS_STORAGE_KEY, []), schedules: [] }, localDate());
  });
  const { transactions, schedules } = ledger;
  function setTransactions(update: (current: Transaction[]) => Transaction[]) {
    setLedger((current) => ({ ...current, transactions: update(current.transactions) }));
  }

  // Store occurrences and their schedule progress together, including deletions.
  useEffect(() => {
    localStorage.setItem(LEDGER_STORAGE_KEY, JSON.stringify(ledger));
  }, [ledger]);

  useEffect(() => {
    const check = () => setLedger((current) => catchUp(current, localDate()));
    const onVisible = () => { if (document.visibilityState === "visible") check(); };
    const interval = window.setInterval(check, 60000);
    window.addEventListener("focus", check);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", check);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, []);

  function addRecurringTransaction(transaction: Transaction, frequency: Frequency) {
    const { date, ...template } = transaction;
    setLedger((current) => catchUp({ ...current, schedules: [...current.schedules,
      { ...template, frequency, startDate: date, nextDueDate: date }],
    }, localDate()));
  }

  function convertToRecurring(transaction: Transaction, frequency: Frequency) {
    const { date, ...template } = transaction;
    setLedger((current) => {
      if (transaction.id.startsWith("recurring:") ||
          !current.transactions.some((item) => item.id === transaction.id) ||
          current.schedules.some((schedule) => schedule.id === transaction.id)) return current;
      // Replace the one-time entry with its scheduled occurrence atomically.
      return catchUp({
        transactions: current.transactions.filter((item) => item.id !== transaction.id),
        schedules: [...current.schedules,
          { ...template, frequency, startDate: date, nextDueDate: date }],
      }, localDate());
    });
  }

  function stopRecurringTransaction(id: string) {
    setLedger((current) => ({ ...current, schedules: current.schedules.filter((schedule) => schedule.id !== id) }));
  }

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

    setLedger((current) => ({
      transactions: current.transactions.filter((transaction) => transaction.accountId !== accountId),
      schedules: current.schedules.filter((schedule) => schedule.accountId !== accountId),
    }));
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
      schedules,
      addRecurringTransaction,
      convertToRecurring,
      stopRecurringTransaction,
      addAccount,
      updateAccount,
      deleteAccount,
      addTransaction,
      deleteTransaction,
      updateTransaction,
    }),
    [accounts, transactions, schedules],
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