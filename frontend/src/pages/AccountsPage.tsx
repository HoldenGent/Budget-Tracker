import AccountCard from "../components/AccountCard";
import AccountForm from "../components/AccountForm";
import { useFinance } from "../context/FinanceContext";
import { calculateAccountBalance } from "../utils/accounts";

export default function AccountsPage() {
  const {
    accounts,
    transactions,
    addAccount,
    deleteAccount,
  } = useFinance();

  return (
    <main className="page">
      <header className="page-header">
        <h1 className="page-title">Accounts</h1>

        <p className="page-description">
          Add and manage your financial accounts.
        </p>
      </header>

      <AccountForm onAdd={addAccount} />

      <section className="page-section">
        <h2>Your accounts</h2>

        {accounts.length === 0 ? (
          <div className="empty-state">
            <p>No accounts yet.</p>
          </div>
        ) : (
          <div className="card-grid">
            {accounts.map((account) => {
              const currentBalance =
                calculateAccountBalance(
                  account,
                  transactions,
                );

              return (
                <AccountCard
                  key={account.id}
                  account={account}
                  currentBalance={currentBalance}
                  onDelete={deleteAccount}
                />
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}