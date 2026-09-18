import React, { StrictMode } from 'react';
import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
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
  expect(screen.queryByLabelText('Account name')).not.toBeInTheDocument();
  await user.click(screen.getByRole('link', { name: 'Add account', exact: true }));
  await user.type(screen.getByLabelText('Account name'), 'Main Checking');
  await user.type(screen.getByLabelText('Starting balance'), '1000');
  await user.click(screen.getByRole('button', { name: 'Add account' }));
  expect(screen.getByRole('link', { name: 'Main Checking $1,000.00' })).toBeInTheDocument();
  await user.click(screen.getByRole('link', { name: 'Transactions', exact: true }));
  expect(screen.queryByLabelText('Description')).not.toBeInTheDocument();
  await user.click(screen.getByRole('link', { name: 'Add transaction' }));
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
  expect(screen.getByRole('heading', { name: 'Groceries' })).toBeInTheDocument();
  expect(screen.getByText('−$125.50')).toBeInTheDocument();
});

it('shows signed income and expenses and persists deletion through the history UI', async () => {
  const user = userEvent.setup();
  const income = { ...expense, id: 'income', type: 'Income', amount: 200, description: 'Paycheck', date: '2026-09-15' };
  localStorage.setItem(accountsKey, JSON.stringify([account]));
  localStorage.setItem(transactionsKey, JSON.stringify([expense, income]));
  const app = renderApp('/transactions');
  expect(screen.getByText('+$200.00')).toHaveClass('transaction-amount--income');
  expect(screen.getByText('−$125.50')).toHaveClass('transaction-amount--expense');
  expect(screen.getAllByRole('link').filter((card) => card.querySelector('h3')).map((card) => card.querySelector('h3')?.textContent))
    .toEqual(['Paycheck', 'Groceries']);

  expect(screen.queryByRole('button', { name: /Delete/ })).not.toBeInTheDocument();
  await user.click(screen.getByRole('link', { name: /Groceries/ }));
  expect(screen.getByLabelText('Description')).toHaveValue('Groceries');
  await user.click(screen.getByRole('button', { name: 'Delete transaction' }));
  expect(screen.queryByRole('heading', { name: 'Groceries' })).not.toBeInTheDocument();
  expect(screen.getByRole('heading', { name: 'Paycheck' })).toBeInTheDocument();
  await user.click(screen.getByRole('link', { name: 'Accounts', exact: true }));
  expect(screen.getByRole('link', { name: 'Main Checking $1,200.00' })).toBeInTheDocument();
  app.unmount();
  renderApp('/transactions');
  expect(screen.queryByRole('heading', { name: 'Groceries' })).not.toBeInTheDocument();
  expect(screen.getByText('+$200.00')).toBeInTheDocument();
  await user.click(screen.getByRole('link', { name: /Paycheck/ }));
  await user.click(screen.getByRole('button', { name: 'Delete transaction' }));
  expect(screen.getByText('No transactions yet.')).toBeInTheDocument();
  expect(JSON.parse(localStorage.getItem(transactionsKey)!)).toEqual([]);
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


it('edits all transaction fields without duplicating it and restores updated balances', async () => {
  const user = userEvent.setup();
  const savings = { ...account, id: 'savings', name: 'Savings', startingBalance: 500 };
  localStorage.setItem(accountsKey, JSON.stringify([account, savings]));
  localStorage.setItem(transactionsKey, JSON.stringify([expense]));
  const app = renderApp('/transactions');
  await user.click(screen.getByRole('link', { name: /Groceries/ }));
  expect(screen.getByLabelText('Amount')).toHaveValue('125.5');
  await user.clear(screen.getByLabelText('Amount'));
  await user.type(screen.getByLabelText('Amount'), '0');
  await user.click(screen.getByRole('button', { name: 'Save changes' }));
  expect(screen.getByText('Please enter an amount greater than zero.')).toBeInTheDocument();
  expect(JSON.parse(localStorage.getItem(transactionsKey)!)).toEqual([expense]);
  await user.clear(screen.getByLabelText('Amount'));
  await user.type(screen.getByLabelText('Amount'), '250');
  await user.clear(screen.getByLabelText('Description'));
  await user.type(screen.getByLabelText('Description'), 'Refund');
  await user.selectOptions(screen.getByLabelText('Account'), 'savings');
  await user.selectOptions(screen.getByLabelText('Type'), 'Income');
  await user.selectOptions(screen.getByLabelText('Category'), 'Income');
  // Date inputs are set via their native change event in jsdom.
  fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-09-16' } });
  await user.click(screen.getByRole('button', { name: 'Save changes' }));
  expect(screen.getByRole('link', { name: /Refund/ })).toHaveTextContent('+$250.00');
  expect(JSON.parse(localStorage.getItem(transactionsKey)!)).toEqual([
    { ...expense, description: 'Refund', amount: 250, accountId: 'savings', type: 'Income', category: 'Income', date: '2026-09-16' },
  ]);
  app.unmount();
  renderApp('/accounts');
  expect(screen.getByRole('link', { name: 'Main Checking $1,000.00' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Savings $750.00' })).toBeInTheDocument();
  await user.click(screen.getByRole('link', { name: 'Transactions', exact: true }));
  await user.click(screen.getByRole('link', { name: /Refund/ }));
  expect(screen.getByLabelText('Amount')).toHaveValue('250');
  await user.clear(screen.getByLabelText('Description'));
  await user.type(screen.getByLabelText('Description'), 'Unsaved change');
  await user.click(screen.getByRole('link', { name: /Back to transactions/ }));
  expect(screen.getByRole('heading', { name: 'Refund' })).toBeInTheDocument();
});

it('puts new same-day expenses first while keeping date order after reload', async () => {
  const user = userEvent.setup();
  const saved = [expense, { ...expense, id: 'later-date', description: 'Later date', date: '2026-09-15' }];
  localStorage.setItem(accountsKey, JSON.stringify([account]));
  localStorage.setItem(transactionsKey, JSON.stringify(saved));
  const app = renderApp('/transactions');
  for (const description of ['Lunch', 'Dinner']) {
    await user.click(screen.getByRole('link', { name: 'Add transaction' }));
    await user.type(screen.getByLabelText('Description'), description);
    await user.type(screen.getByLabelText('Amount'), '10');
    fireEvent.change(screen.getByLabelText('Date'), { target: { value: expense.date } });
    await user.click(screen.getByRole('button', { name: 'Add transaction' }));
  }
  const titles = () => screen.getAllByRole('heading', { level: 3 }).map((heading) => heading.textContent);
  expect(titles()).toEqual(['Later date', 'Dinner', 'Lunch', 'Groceries']);
  expect(JSON.parse(localStorage.getItem(transactionsKey)!).map((item: { description: string }) => item.description))
    .toEqual(['Groceries', 'Later date', 'Lunch', 'Dinner']);
  app.unmount();
  renderApp('/transactions');
  expect(titles()).toEqual(['Later date', 'Dinner', 'Lunch', 'Groceries']);
});

it('handles an invalid or deleted transaction URL', () => {
  renderApp('/transactions/missing');
  expect(screen.getByRole('heading', { name: 'Transaction not found' })).toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Back to transactions' })).toHaveAttribute('href', '/transactions');
});


it('offers account creation from the accounts list and leaves unsaved accounts out of storage', async () => {
  localStorage.setItem(accountsKey, JSON.stringify([account]));
  const user = userEvent.setup();
  renderApp(`/accounts/${account.id}`);
  expect(screen.queryByRole('link', { name: 'Add account', exact: true })).not.toBeInTheDocument();
  await user.click(screen.getByRole('link', { name: /Back to accounts/ }));
  await user.click(screen.getByRole('link', { name: 'Add account', exact: true }));
  expect(screen.getByRole('heading', { name: 'New account' })).toBeInTheDocument();
  await user.type(screen.getByLabelText('Account name'), 'Unsaved savings');
  await user.click(screen.getByRole('link', { name: /Back to accounts/ }));
  expect(screen.queryByLabelText('Account name')).not.toBeInTheDocument();
  expect(screen.getByRole('link', { name: 'Main Checking $1,000.00' })).toBeInTheDocument();
  expect(JSON.parse(localStorage.getItem(accountsKey)!)).toEqual([account]);
});

it('edits an account without losing its transactions and filters its clickable history', async () => {
  const user = userEvent.setup();
  const other = { ...account, id: 'other', name: 'Other account' };
  const newer = { ...expense, id: 'newer', description: 'Lunch', amount: 10 };
  const unrelated = { ...expense, id: 'unrelated', accountId: other.id, description: 'Other expense' };
  localStorage.setItem(accountsKey, JSON.stringify([account, other]));
  localStorage.setItem(transactionsKey, JSON.stringify([expense, unrelated, newer]));
  const app = renderApp(`/accounts/${account.id}`);
  expect(screen.queryByLabelText('Account name')).not.toBeInTheDocument();
  expect(screen.getAllByRole('heading', { level: 3 }).map((h) => h.textContent)).toEqual(['Lunch', 'Groceries']);
  expect(screen.queryByRole('link', { name: /Other expense/ })).not.toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Edit account' }));
  expect(screen.getByLabelText('Starting balance')).toHaveValue('1000');
  await user.clear(screen.getByLabelText('Account name'));
  await user.click(screen.getByRole('button', { name: 'Save changes' }));
  expect(screen.getByText('Please enter an account name.')).toBeInTheDocument();
  await user.type(screen.getByLabelText('Account name'), 'Savings');
  await user.selectOptions(screen.getByLabelText('Account type'), 'Savings');
  await user.clear(screen.getByLabelText('Starting balance'));
  await user.type(screen.getByLabelText('Starting balance'), '2000');
  await user.click(screen.getByRole('button', { name: 'Save changes' }));
  expect(screen.getByText('$1,864.50')).toBeInTheDocument();
  expect(JSON.parse(localStorage.getItem(accountsKey)!)).toEqual([
    { ...account, name: 'Savings', type: 'Savings', startingBalance: 2000 }, other,
  ]);
  expect(JSON.parse(localStorage.getItem(transactionsKey)!)).toEqual([expense, unrelated, newer]);
  app.unmount();
  renderApp(`/accounts/${account.id}`);
  expect(screen.getByRole('heading', { name: 'Savings', level: 1 })).toBeInTheDocument();
  expect(screen.getByText('$1,864.50')).toBeInTheDocument();
  await user.click(screen.getByRole('button', { name: 'Edit account' }));
  await user.clear(screen.getByLabelText('Account name'));
  await user.type(screen.getByLabelText('Account name'), 'Discard this');
  await user.click(screen.getByRole('button', { name: 'Cancel' }));
  expect(screen.getByRole('heading', { name: 'Savings', level: 1 })).toBeInTheDocument();
  await user.click(screen.getByRole('link', { name: /Groceries/ }));
  expect(screen.getByRole('heading', { name: 'Groceries', level: 1 })).toBeInTheDocument();
  expect(screen.getByLabelText('Amount')).toHaveValue('125.5');
});

it.each(['save', 'delete', 'back'])('returns to the originating account after transaction %s', async (action) => {
  const user = userEvent.setup();
  const other = { ...account, id: 'other', name: 'Other account' };
  localStorage.setItem(accountsKey, JSON.stringify([account, other]));
  localStorage.setItem(transactionsKey, JSON.stringify([expense]));
  renderApp(`/accounts/${account.id}`);
  await user.click(screen.getByRole('link', { name: /Groceries/ }));
  expect(screen.getByRole('link', { name: /Back to account/ })).toHaveAttribute('href', `/accounts/${account.id}`);
  if (action === 'save') {
    // Moving the transaction must still return to the account we opened it from.
    await user.selectOptions(screen.getByLabelText('Account'), other.id);
    await user.click(screen.getByRole('button', { name: 'Save changes' }));
  } else if (action === 'delete') {
    await user.click(screen.getByRole('button', { name: 'Delete transaction' }));
  } else {
    await user.clear(screen.getByLabelText('Description'));
    await user.type(screen.getByLabelText('Description'), 'Unsaved');
    await user.click(screen.getByRole('link', { name: /Back to account/ }));
  }
  expect(screen.getByRole('heading', { name: account.name, level: 1 })).toBeInTheDocument();
  expect(screen.getByText(action === 'back' ? '$874.50' : '$1,000.00')).toBeInTheDocument();
  if (action === 'back') {
    expect(screen.getByRole('link', { name: /Groceries/ })).toBeInTheDocument();
  } else {
    expect(screen.getByText('No transactions yet.')).toBeInTheDocument();
  }
});

it('falls back to transaction history when transaction details are opened directly', async () => {
  localStorage.setItem(accountsKey, JSON.stringify([account]));
  localStorage.setItem(transactionsKey, JSON.stringify([expense]));
  const user = userEvent.setup();
  renderApp(`/transactions/${expense.id}`);
  expect(screen.getByRole('link', { name: /Back to transactions/ })).toHaveAttribute('href', '/transactions');
  await user.click(screen.getByRole('button', { name: 'Save changes' }));
  expect(screen.getByRole('heading', { name: 'Transactions', level: 1 })).toBeInTheDocument();
});
