import { Link, useLocation } from "react-router-dom";
import type { Account } from "../types/Account";
import type { Transaction } from "../types/Transactions";
import { formatCurrency } from "../utils/currency";

export default function TransactionList({ accounts, transactions }: {
  accounts: Account[];
  transactions: Transaction[];
}) {
  const location = useLocation();

  // New entries are appended, so reverse a copy first. The stable date sort
  // keeps most recent entries first when their transaction dates match.
      // when the dates match localeCompare returns 0
  const sortedTransactions = transactions.toReversed().toSorted(
    (a, b) => b.date.localeCompare(a.date),
  );
  return (
    <>
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
                  state={{ returnTo: location.pathname }}
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
    </>
  );
}
