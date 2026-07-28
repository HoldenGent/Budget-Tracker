import { Link, useParams } from "react-router-dom";
import { useAccounts } from "../hooks/useAccounts";

export default function AccountDetailsPage() {
  const { accountId } = useParams();
  const { accounts } = useAccounts();

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

  const formattedBalance = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(account.balance);

  return (
    <main className="page">
      <header className="page-header">
        <Link to="/accounts">← Back to accounts</Link>

        <h1 className="page-title">{account.name}</h1>
        <p className="page-description">Type: {account.type}</p>
      </header>

      <section className="card">
        <h2 className="card-title">Current balance</h2>
        <p className="card-value">{formattedBalance}</p>
      </section>
    </main>
  );
}