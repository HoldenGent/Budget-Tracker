import React from 'react';
import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, expect, it, vi } from 'vitest';
import App from '../src/App';
import { FinanceProvider, useFinance } from '../src/context/FinanceContext';

const account = { id: 'checking', name: 'Checking', type: 'Checking', startingBalance: 1000 };
const transaction = { id: 'subscription', accountId: 'checking', description: 'Subscription', amount: 10,
  type: 'Expense' as const, category: 'Other', date: '2026-01-31' };
function setDate(year: number, month: number, day: number) {
  vi.setSystemTime(new Date(year, month - 1, day, 12));
}
afterEach(() => vi.useRealTimers());

it('expands recurring options, saves a future schedule, catches up on focus, and stops it', async () => {
  vi.useFakeTimers({ toFake: ['Date'] });
  setDate(2026, 1, 30);
  localStorage.setItem('budget-tracker-accounts', JSON.stringify([account]));
  const user = userEvent.setup();
  const app = render(<MemoryRouter initialEntries={['/transactions/new']}><FinanceProvider><App /></FinanceProvider></MemoryRouter>);
  expect(screen.queryByLabelText('Repeat')).not.toBeInTheDocument();
  await user.click(screen.getByRole('switch', { name: 'Recurring transaction' }));
  expect(screen.getByLabelText('Repeat')).toHaveValue('Monthly');
  await user.type(screen.getByLabelText('Description'), 'Subscription');
  await user.type(screen.getByLabelText('Amount'), '10');
  fireEvent.change(screen.getByLabelText('Date'), { target: { value: '2026-01-31' } });
  await user.click(screen.getByRole('button', { name: 'Add transaction' }));
  expect(screen.getByText('No transactions yet.')).toBeInTheDocument();
  expect(screen.getByText(/Next: 2026-01-31/)).toBeInTheDocument();
  setDate(2026, 3, 31);
  act(() => window.dispatchEvent(new Event('focus')));
  expect(screen.getAllByRole('link').filter((link) => link.textContent?.includes('Subscription'))).toHaveLength(3);
  expect(screen.getByText(/Next: 2026-04-30/)).toBeInTheDocument();
  act(() => window.dispatchEvent(new Event('focus')));
  expect(JSON.parse(localStorage.getItem('budget-tracker-ledger')!).transactions).toHaveLength(3);
  app.unmount();
  const restored = renderHook(useFinance, { wrapper: FinanceProvider });
  expect(restored.result.current.transactions).toHaveLength(3);
  act(() => restored.result.current.stopRecurringTransaction(restored.result.current.schedules[0].id));
  setDate(2026, 6, 30);
  act(() => window.dispatchEvent(new Event('focus')));
  expect(restored.result.current.transactions).toHaveLength(3);
  expect(restored.result.current.schedules).toEqual([]);
});

it('preserves edited/deleted occurrences across reload and cancels schedules when accounts are deleted', () => {
  vi.useFakeTimers({ toFake: ['Date'] });
  setDate(2026, 1, 31);
  localStorage.setItem('budget-tracker-accounts', JSON.stringify([account]));
  const first = renderHook(useFinance, { wrapper: FinanceProvider });
  act(() => first.result.current.addRecurringTransaction(transaction, 'Monthly'));
  const occurrence = first.result.current.transactions[0];
  act(() => first.result.current.updateTransaction({ ...occurrence, amount: 20 }));
  expect(first.result.current.schedules[0].amount).toBe(10);
  act(() => first.result.current.deleteTransaction(occurrence.id));
  first.unmount();
  const second = renderHook(useFinance, { wrapper: FinanceProvider });
  expect(second.result.current.transactions).toEqual([]);
  setDate(2026, 2, 28);
  act(() => window.dispatchEvent(new Event('focus')));
  expect(second.result.current.transactions).toHaveLength(1);
  expect(second.result.current.transactions[0].amount).toBe(10);
  act(() => second.result.current.deleteAccount(account.id));
  expect(second.result.current.schedules).toEqual([]);
  setDate(2026, 3, 31);
  act(() => window.dispatchEvent(new Event('focus')));
  expect(second.result.current.transactions).toEqual([]);
});

it('converts an edited transaction to recurring without duplicating the first occurrence', async () => {
  vi.useFakeTimers({ toFake: ['Date'] });
  setDate(2026, 1, 31);
  localStorage.setItem('budget-tracker-accounts', JSON.stringify([account]));
  localStorage.setItem('budget-tracker-transactions', JSON.stringify([transaction]));
  const user = userEvent.setup();
  const app = render(<MemoryRouter initialEntries={['/accounts/checking']}><FinanceProvider><App /></FinanceProvider></MemoryRouter>);
  await user.click(screen.getByRole('link', { name: /Subscription/ }));
  await user.click(screen.getByRole('switch', { name: 'Recurring transaction' }));
  await user.selectOptions(screen.getByLabelText('Repeat'), 'Monthly');
  await user.clear(screen.getByLabelText('Amount'));
  await user.type(screen.getByLabelText('Amount'), '25');
  await user.click(screen.getByRole('button', { name: 'Save changes' }));
  expect(screen.getByRole('heading', { name: 'Checking', level: 1 })).toBeInTheDocument();
  expect(screen.getByText('$975.00')).toBeInTheDocument();
  await user.click(screen.getByRole('link', { name: /Subscription/ }));
  expect(screen.queryByRole('switch', { name: 'Recurring transaction' })).not.toBeInTheDocument();
  app.unmount();
  const restored = renderHook(useFinance, { wrapper: FinanceProvider });
  expect(restored.result.current.transactions).toHaveLength(1);
  expect(restored.result.current.schedules[0].nextDueDate).toBe('2026-02-28');
  setDate(2026, 2, 28);
  act(() => window.dispatchEvent(new Event('focus')));
  expect(restored.result.current.transactions.map((item) => item.amount)).toEqual([25, 25]);
});

it('keeps a converted future transaction out of balances until due', () => {
  vi.useFakeTimers({ toFake: ['Date'] });
  setDate(2026, 1, 30);
  localStorage.setItem('budget-tracker-accounts', JSON.stringify([account]));
  localStorage.setItem('budget-tracker-transactions', JSON.stringify([transaction]));
  const { result } = renderHook(useFinance, { wrapper: FinanceProvider });
  act(() => result.current.convertToRecurring(transaction, 'Weekly'));
  expect(result.current.transactions).toEqual([]);
  expect(result.current.schedules).toHaveLength(1);
  act(() => result.current.convertToRecurring(transaction, 'Weekly'));
  expect(result.current.schedules).toHaveLength(1);
  setDate(2026, 1, 31);
  act(() => window.dispatchEvent(new Event('focus')));
  expect(result.current.transactions).toHaveLength(1);
});
