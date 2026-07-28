import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import type { Account, AccountType } from "../types/Account";

interface AccountFormProps {
  onAdd: (account: Account) => void;
}

const accountTypes: AccountType[] = [
  "Checking",
  "Savings",
  "Credit Card",
  "Cash",
];

export default function AccountForm({ onAdd }: AccountFormProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<AccountType>("Checking");
  const [balance, setBalance] = useState("");
  const [error, setError] = useState("");

  function handleBalanceChange(event: ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;

    // Allows digits one decimal point and up to two decimal places.
    if (/^\d*\.?\d{0,2}$/.test(value)) {
      setBalance(value);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!name.trim()) {
      setError("Please enter an account name.");
      return;
    }

    const numericBalance = Number(balance);

    if (balance === "" || Number.isNaN(numericBalance)) {
      setError("Please enter a valid starting balance.");
      return;
    }

    onAdd({
      id: crypto.randomUUID(),
      name: name.trim(),
      type,
      balance: numericBalance,
    });

    setName("");
    setType("Checking");
    setBalance("");
    setError("");
  }

  return (
    <div className="card">
      <h2>Add an account</h2>

      <p className="card-subtitle">
        Enter the account details and current starting balance.
      </p>

      <form className="form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label" htmlFor="account-name">
            Account name
          </label>

          <input
            id="account-name"
            className="form-input"
            type="text"
            placeholder="Example: Main Checking"
            value={name}
            onChange={(event) => setName(event.target.value)}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label className="form-label" htmlFor="account-type">
              Account type
            </label>

            <select
              id="account-type"
              className="form-select"
              value={type}
              onChange={(event) =>
                setType(event.target.value as AccountType)
              }
            >
              {accountTypes.map((accountType) => (
                <option key={accountType} value={accountType}>
                  {accountType}
                </option>
              ))}
            </select>
          </div>


              {/* Need to validate format */}
          <div className="form-group">
            <label className="form-label" htmlFor="starting-balance">
              Starting balance
            </label>

            <div className="currency-input">
              <span className="currency-symbol">$</span>

              <input
                id="starting-balance"
                className="form-input"
                type="text"
                inputMode="decimal"
                placeholder="0.00"
                value={balance}
                onChange={handleBalanceChange}
              />
            </div>
          </div>
        </div>

        {error && <p className="form-error">{error}</p>}

        <button className="button" type="submit">
          Add account
        </button>
      </form>
    </div>
  );
}