import TransactionForm from "../components/TransactionForm";
import { useFinance } from "../context/FinanceContext";

export default function TransactionsPage() {
  const { accounts, transactions, addTransaction } = useFinance();

  return (
    <main className="page">
      <header className="page-header">
        <h1 className="page-title">Transactions</h1>

        <p className="page-description">
          Record and review your income and expenses.
        </p>
      </header>

      <TransactionForm
        accounts={accounts}
        onAdd={addTransaction}
      />

      <section className="page-section">
        <h2>Recent transactions</h2>

        {transactions.length === 0 ? (
          <div className="empty-state">
            <p>No transactions yet.</p>
          </div>
        ) : (
          <p>
            You have {transactions.length} transaction
            {transactions.length === 1 ? "" : "s"}.
          </p>
        )}
      </section>
    </main>
  );
}