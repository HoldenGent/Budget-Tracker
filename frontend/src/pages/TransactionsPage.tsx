import { Link } from "react-router-dom";
import { useFinance } from "../context/FinanceContext";
import { formatCurrency } from "../utils/currency";

export default function TransactionsPage() {
  const { accounts, transactions } = useFinance();

  // New entries are appended, so reverse a copy first. The stable date sort
  // keeps most recent entries first when their transaction dates match.
      // when the dates match localeCompare returns 0
  const sortedTransactions = transactions.toReversed().toSorted(
    (a, b) => b.date.localeCompare(a.date),
  );
  // no transactions or display 
  return (
    <main className="page">
      <header className="page-header transactions-header">
        <div>
          <h1 className="page-title">Transactions</h1>
        </div>
        <Link className="button" to="/transactions/new">Add transaction</Link>
      </header>
      <section className="page-section">
        {sortedTransactions.length === 0 ? (
          <div className="empty-state">
            <p>No transactions yet.</p> 
          </div>
        ) : (
          <div className="transaction-list">
            {sortedTransactions.map((transaction) => {
              const account = accounts.find(
                (account) => account.id === transaction.accountId,
              );

              return (
                <Link
                  className="card account-card account-card-link transaction-card"
                  key={transaction.id}
                  to={`/transactions/${transaction.id}`}
                >
                  <div className="transaction-card-header">
                    <h3 className="card-title">{transaction.description}</h3>
                    <p className={`transaction-amount transaction-amount--${transaction.type.toLowerCase()}`}>
                      {transaction.type === "Expense" ? "−" : "+"}
                      {formatCurrency(transaction.amount)}
                    </p>
                  </div>
                  <div className="transaction-meta">
                    <span>{account?.name ?? "Unknown account"}</span>
                    <span>{transaction.category}</span>
                    <time dateTime={transaction.date}>{transaction.date}</time>
                    <span>{transaction.type}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
