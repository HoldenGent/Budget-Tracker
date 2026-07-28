import { useEffect, useState } from "react";
import type { Account } from "../types/Account";

const STORAGE_KEY = "budget-tracker-accounts";

export function useAccounts() {
  const [accounts, setAccounts] = useState<Account[]>(() => {
    const savedAccounts = localStorage.getItem(STORAGE_KEY);

    if (!savedAccounts) {
      return [];
    }

    try {
      return JSON.parse(savedAccounts) as Account[];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
  }, [accounts]);

  function addAccount(account: Account) {
    setAccounts((previousAccounts) => [...previousAccounts, account]);
  }

  function deleteAccount(accountId: string) {
    setAccounts((previousAccounts) =>
      previousAccounts.filter((account) => account.id !== accountId),
    );
  }

  return {
    accounts,
    addAccount,
    deleteAccount,
  };
}