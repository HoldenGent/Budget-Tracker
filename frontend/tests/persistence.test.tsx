import React, { StrictMode } from 'react';
import { act, render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { expect, it } from 'vitest';
import App from '../src/App';
import { FinanceProvider, useFinance } from '../src/context/FinanceContext';

const accountsKey = 'budget-tracker-accounts';
const transactionsKey = 'budget-tracker-transactions';
const account = { id: 'checking', name: 'Main Checking', type: 'Checking' as const, startingBalance: 1000 };
const expense = { id: 'expense', accountId: account.id, type: 'Expense' as const, amount: 125.5,
  description: 'Groceries', date: '2026-09-14', category: 'Food' };

function renderApp(path = '/accounts') {
  return render(<StrictMode><MemoryRouter initialEntries={[path]}>
    <FinanceProvider><App /></FinanceProvider>
  </MemoryRouter></StrictMode>);
}

it('creates an account and expense through the UI and restores both after a fresh mount', async () => {
  const user = userEvent.setup();
  const app = renderApp();
  await user.type(screen.getByLabelText('Account name'), 'Main Checking');
  await user.type(screen.getByLabelText('Starting balance'), '1000');
  await user.click(screen.getByRole('button', { name: 'Add account' }));
  expect(screen.getByRole('link', { name: 'Main Checking $1,000.00' })).toBeInTheDocument();
  await user.click(screen.getByRole('link', { name: 'Transactions', exact: true }));
  await user.type(screen.getByLabelText('Description'), 'Groceries');
  await user.type(screen.getByLabelText('Amount'), '125.50');
  await user.click(screen.getByRole('button', { name: 'Add transaction' }));
  await user.click(screen.getByRole('link', { name: 'Accounts', exact: true }));
  await user.click(screen.getByRole('link', { name: 'Main Checking $874.50' }));
  expect(screen.getByText('$874.50')).toBeInTheDocument();

  const savedAccounts = JSON.parse(localStorage.getItem(accountsKey)!);
  const savedTransactions = JSON.parse(localStorage.getItem(transactionsKey)!);
  expect(savedAccounts).toHaveLength(1);
  expect(savedAccounts[0]).toMatchObject({ name: 'Main Checking', type: 'Checking', startingBalance: 1000 });
  expect(savedTransactions).toHaveLength(1);
  expect(savedTransactions[0]).toMatchObject({ accountId: savedAccounts[0].id, description: 'Groceries', type: 'Expense', amount: 125.5 });

  // A new provider discards all React state and must load the saved records.
  app.unmount();
  renderApp(`/accounts/${savedAccounts[0].id}`);
  expect(screen.getByRole('heading', { name: 'Main Checking' })).toBeInTheDocument();
  expect(screen.getByText('$874.50')).toBeInTheDocument();
  await user.click(screen.getByRole('link', { name: 'Accounts', exact: true }));
  expect(screen.getByRole('link', { name: 'Main Checking $874.50' })).toBeInTheDocument();
  await user.click(screen.getByRole('link', { name: 'Transactions', exact: true }));
  expect(screen.getByText(/You have 1 transaction/)).toBeInTheDocument();
});

it('loads legacy accounts with existing transactions and saves the migrated opening balance', () => {
  localStorage.setItem(accountsKey, JSON.stringify([{ id: account.id, name: account.name, type: account.type, balance: 1000 }]));
  localStorage.setItem(transactionsKey, JSON.stringify([expense]));
  const app = renderApp();
  expect(screen.getByRole('link', { name: 'Main Checking $874.50' })).toBeInTheDocument();
  expect(JSON.parse(localStorage.getItem(accountsKey)!)).toEqual([account]);
  app.unmount();
  renderApp();
  expect(screen.getByRole('link', { name: 'Main Checking $874.50' })).toBeInTheDocument();
});

it('starts empty when saved JSON cannot be parsed', () => {
  localStorage.setItem(accountsKey, '{broken');
  localStorage.setItem(transactionsKey, '{broken');
  const { result } = renderHook(useFinance, { wrapper: FinanceProvider });
  expect(result.current.accounts).toEqual([]);
  expect(result.current.transactions).toEqual([]);
});

it('persists transaction deletion and removes only the deleted account’s transactions', () => {
  const otherAccount = { ...account, id: 'savings', name: 'Savings' };
  const otherExpense = { ...expense, id: 'other-expense', accountId: otherAccount.id };
  const { result, unmount } = renderHook(useFinance, { wrapper: FinanceProvider });
  act(() => {
    result.current.addAccount(account);
    result.current.addAccount(otherAccount);
    result.current.addTransaction(expense);
    result.current.addTransaction(otherExpense);
  });
  act(() => result.current.deleteTransaction(expense.id));
  expect(result.current.transactions).toEqual([otherExpense]);
  expect(JSON.parse(localStorage.getItem(transactionsKey)!)).toEqual([otherExpense]);
  act(() => result.current.addTransaction(expense));
  act(() => result.current.deleteAccount(account.id));
  expect(result.current.accounts).toEqual([otherAccount]);
  expect(result.current.transactions).toEqual([otherExpense]);
  unmount();
  const restored = renderHook(useFinance, { wrapper: FinanceProvider });
  expect(restored.result.current.accounts).toEqual([otherAccount]);
  expect(restored.result.current.transactions).toEqual([otherExpense]);
});
