import AccountCard from "../components/AccountCard";
import AccountForm from "../components/AccountForm";
import { useAccounts } from "../hooks/useAccounts";

export default function AccountsPage() {
  const { accounts, addAccount } = useAccounts();

  return (
    <main className="page">
      <header className="page-header">
        <h1 className="page-title">Accounts</h1>

        <p className="page-description">
          Manage the accounts used to track your balances and transactions.
        </p>
      </header>

      <AccountForm onAdd={addAccount} />

      <section className="page-section">
        <div className="section-header">
          <h2>Your accounts</h2>
        </div>

        {accounts.length === 0 ? (
          <div className="empty-state">
            <p>You have not added any accounts yet.</p>
          </div>
        ) : (
          <div className="card-grid">
            {accounts.map((account) => (
              <AccountCard key={account.id} account={account} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}