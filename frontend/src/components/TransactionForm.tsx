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
  onAdd: (transaction: Transaction) => void;
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
  return new Date().toISOString().split("T")[0];
}

export default function TransactionForm({
  accounts,
  onAdd,
}: TransactionFormProps) {
  const [accountId, setAccountId] = useState(
    accounts[0]?.id ?? "",
  );
  const [description, setDescription] = useState("");
  const [type, setType] =
    useState<TransactionType>("Expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Other");
  const [date, setDate] = useState(getTodayDate());
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

    if (!accountId) {
      setError("Please select an account.");
      return;
    }

    if (!description.trim()) {
      setError("Please enter a description.");
      return;
    }

    const numericAmount = parseCurrency(amount);

    if (numericAmount === null || numericAmount <= 0) {
      setError("Please enter an amount greater than zero.");
      return;
    }

    if (!date) {
      setError("Please select a date.");
      return;
    }

    onAdd({
      id: crypto.randomUUID(),
      accountId,
      description: description.trim(),
      amount: numericAmount,
      type,
      date,
      category,
    });

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
        <h2>Add a transaction</h2>

        <p className="card-subtitle">
          Add an account before creating transactions.
        </p>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Add a transaction</h2>

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

        {error && (
          <p className="form-error">{error}</p>
        )}

        <button className="button" type="submit">
          Add transaction
        </button>
      </form>
    </div>
  );
}