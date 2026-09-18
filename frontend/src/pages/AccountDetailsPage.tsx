import { useState } from "react";
import AccountForm from "../components/AccountForm";
import TransactionList from "../components/TransactionList";
import { Link, useParams } from "react-router-dom";
import { useFinance } from "../context/FinanceContext";
import { calculateAccountBalance } from "../utils/accounts";
import { formatCurrency } from "../utils/currency";

export default function AccountDetailsPage() {
  const { accountId } = useParams();
  const { accounts, transactions, updateAccount } = useFinance();
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);

  const account = accounts.find(
    (currentAccount) => currentAccount.id === accountId,
  );

  if (!account) {
    return (
      <main className="page">
        <h1 className="page-title">Account not found</h1>
        <p className="page-description">
          This account may have been deleted or the link may be invalid.
        </p>

        <Link className="button" to="/accounts">
          Back to accounts
        </Link>
      </main>
    );
  }

  // only want to show account type if it does not match the name
  const accountNameIsType =
    account.name.trim().toLowerCase() === account.type.toLowerCase();

  const formattedBalance = formatCurrency(
    calculateAccountBalance(account, transactions),
  );

  return (
    <main className="page">
      <header className="page-header page-header-actions">
        <div>
        <Link to="/accounts">← Back to accounts</Link>

        
        <h1 className="page-title">{account.name}</h1>
        {!accountNameIsType && (
          <p className="page-description">{account.type}</p>
        )}
        </div>
        <div className="account-actions">
          <button className="button" type="button" onClick={() => setEditingAccountId(account.id)}>Edit account</button>
        </div>
      </header>

      {editingAccountId === account.id && (
        <section className="page-section account-edit">
          <AccountForm
            key={account.id}
            initialAccount={account}
            onCancel={() => setEditingAccountId(null)}
            onAdd={(updated) => {
              updateAccount(updated);
              setEditingAccountId(null);
            }}
          />
        </section>
      )}
      <section className="card">
        <h2 className="card-title">Current balance</h2>
        <p className="card-value">{formattedBalance}</p>
      </section>
      <section className="page-section">
        <h2>Account transactions</h2>
        <TransactionList
          accounts={accounts}
          transactions={transactions.filter((transaction) => transaction.accountId === account.id)}
        />
      </section>
    </main>
  );
}
