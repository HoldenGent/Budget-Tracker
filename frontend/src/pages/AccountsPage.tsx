import AccountCard from "../components/AccountCard";
import { Link } from "react-router-dom";
import { useFinance } from "../context/FinanceContext";
import { calculateAccountBalance } from "../utils/accounts";

export default function AccountsPage() {
  const {
    accounts,
    transactions,
    deleteAccount,
  } = useFinance();

  return (
    <main className="page">
      <header className="page-header page-header-actions">
        <div>
          <h1 className="page-title">Your Accounts</h1>
        </div>
        <Link className="button" to="/accounts/new">Add account</Link>
      </header>

      <section className="page-section">
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