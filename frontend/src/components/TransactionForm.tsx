import { localDate, isCalendarDate } from "../utils/recurring";
import type { Frequency } from "../types/RecurringTransaction";
import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import type { Account } from "../types/Account";
import type {
  Transaction,
  TransactionType,
} from "../types/Transactions";
import {
  isValidCurrencyInput,
  parseCurrency,
} from "../utils/currency";

interface TransactionFormProps {
  accounts: Account[];
  onAdd: (transaction: Transaction, frequency?: Frequency) => void;
  initialTransaction?: Transaction;
}

const transactionTypes: TransactionType[] = [
  "Expense",
  "Income",
];

const categories = [
  "Housing",
  "Food",
  "Transportation",
  "Entertainment",
  "Utilities",
  "Income",
  "Other",
];

function getTodayDate(): string {
  return localDate();
}

export default function TransactionForm({
  accounts,
  onAdd,
  initialTransaction,
}: TransactionFormProps) {
  const [accountId, setAccountId] = useState(
    initialTransaction?.accountId ?? accounts[0]?.id ?? "",
  );
  const [description, setDescription] = useState(initialTransaction?.description ?? "");
  const [type, setType] =
    useState<TransactionType>(initialTransaction?.type ?? "Expense");
  const [amount, setAmount] = useState(initialTransaction?.amount.toString() ?? "");
  const [category, setCategory] = useState(initialTransaction?.category ?? "Other");
  const [date, setDate] = useState(initialTransaction?.date ?? getTodayDate());
  const [recurring, setRecurring] = useState(false);
  const [frequency, setFrequency] = useState<Frequency>("Monthly");
  const [error, setError] = useState("");

  function handleAmountChange(
    event: ChangeEvent<HTMLInputElement>,
  ) {
    const value = event.target.value;

    if (isValidCurrencyInput(value)) {
      setAmount(value);
      setError("");
    }
  }

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!accounts.some((account) => account.id === accountId)) {
      setError("Please select an account.");
      return;
    }

    if (!description.trim()) {
      setError("Please enter a description.");
      return;
    }

    const numericAmount = parseCurrency(amount);

    if (numericAmount === null || !Number.isFinite(numericAmount) || numericAmount <= 0) {
      setError("Please enter an amount greater than zero.");
      return;
    }

    if (!isCalendarDate(date)) {
      setError("Please select a date.");
      return;
    }

    onAdd({
      id: initialTransaction?.id ?? crypto.randomUUID(),
      accountId,
      description: description.trim(),
      amount: numericAmount,
      type,
      date,
      category,
    }, recurring ? frequency : undefined);

    if (initialTransaction) return;

    setDescription("");
    setType("Expense");
    setAmount("");
    setCategory("Other");
    setDate(getTodayDate());
    setError("");
  }

  if (accounts.length === 0) {
    return (
      <div className="card">
        <h2>{initialTransaction ? "Edit transaction" : "Add a transaction"}</h2>

        <p className="card-subtitle">
          Add an account before creating transactions.
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>{initialTransaction ? "Edit transaction" : "Add a transaction"}</h2>

      <p className="card-subtitle">
        Record income or spending for one of your accounts.
      </p>

      <form className="form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label
            className="form-label"
            htmlFor="transaction-account"
          >
            Account
          </label>

          <select
            id="transaction-account"
            className="form-select"
            value={accountId}
            onChange={(event) => {
              setAccountId(event.target.value);
              setError("");
            }}
          >
            {accounts.map((account) => (
              <option
                key={account.id}
                value={account.id}
              >
                {account.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label
            className="form-label"
            htmlFor="transaction-description"
          >
            Description
          </label>

          <input
            id="transaction-description"
            className="form-input"
            type="text"
            placeholder="Example: Grocery Store"
            value={description}
            onChange={(event) => {
              setDescription(event.target.value);
              setError("");
            }}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label
              className="form-label"
              htmlFor="transaction-type"
            >
              Type
            </label>

            <select
              id="transaction-type"
              className="form-select"
              value={type}
              onChange={(event) => {
                setType(
                  event.target.value as TransactionType,
                );
                setError("");
              }}
            >
              {transactionTypes.map((transactionType) => (
                <option
                  key={transactionType}
                  value={transactionType}
                >
                  {transactionType}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label
              className="form-label"
              htmlFor="transaction-amount"
            >
              Amount
            </label>

            <div className="currency-input">
              <span className="currency-symbol">$</span>

              <input
                id="transaction-amount"
                className="form-input"
                type="text"
                inputMode="decimal"
                placeholder="0.00"
                value={amount}
                onChange={handleAmountChange}
              />
            </div>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label
              className="form-label"
              htmlFor="transaction-category"
            >
              Category
            </label>

            <select
              id="transaction-category"
              className="form-select"
              value={category}
              onChange={(event) => {
                setCategory(event.target.value);
                setError("");
              }}
            >
              {categories.map((currentCategory) => (
                <option
                  key={currentCategory}
                  value={currentCategory}
                >
                  {currentCategory}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label
              className="form-label"
              htmlFor="transaction-date"
            >
              Date
            </label>

            <input
              id="transaction-date"
              className="form-input"
              type="date"
              value={date}
              onChange={(event) => {
                setDate(event.target.value);
                setError("");
              }}
            />
          </div>
        </div>

        {!initialTransaction?.id.startsWith("recurring:") && (
          <div className="form-group">
            <label className="recurring-toggle">
              <input type="checkbox" role="switch" checked={recurring}
                onChange={(event) => setRecurring(event.target.checked)} />
              Recurring transaction
            </label>
            {recurring && (
              <div className="recurring-options">
                <label className="form-label" htmlFor="recurring-frequency">Repeat</label>
                <select id="recurring-frequency" className="form-select" value={frequency}
                  onChange={(event) => setFrequency(event.target.value as Frequency)}>
                  <option>Weekly</option><option>Monthly</option><option>Yearly</option>
                </select>
                <p className="card-subtitle">The date above is the first occurrence. 
                  Due entries are recorded automatically when you open the app.</p>
              </div>
            )}
          </div>
        )}
        {initialTransaction?.id.startsWith("recurring:") && (
          <p>Changes here affect only this occurrence, not future recurring entries.</p>
        )}
        {error && (
          <p className="form-error">{error}</p>
        )}

        <button className="button" type="submit">
          {initialTransaction ? "Save changes" : "Add transaction"}
        </button>
      </form>
    </div>
  );
}