import { formatCurrency } from "../utils/currency";
import { Link } from "react-router-dom";
import { useFinance } from "../context/FinanceContext";
import TransactionList from "../components/TransactionList";

export default function TransactionsPage() {
  const { accounts, transactions, schedules, stopRecurringTransaction } = useFinance();

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
        <TransactionList accounts={accounts} transactions={transactions} />
      </section>
      {schedules.length > 0 && (
        <section className="page-section">
          <h2>Recurring transactions</h2>
          <p>Stopping a schedule keeps past transactions. To change future entries, stop it and create a new schedule.</p>
          <div className="transaction-list">
            {schedules.map((schedule) => (
              <article className="card" key={schedule.id}>
                <div className="transaction-card-header">
                  <h3>{schedule.description}</h3>
                  <span>{formatCurrency(schedule.amount)} · {schedule.type}</span>
                </div>
                <p>{accounts.find((account) => account.id === schedule.accountId)?.name} · {schedule.frequency} · Next: {schedule.nextDueDate}</p>
                <button className="button" type="button" aria-label={`Stop recurring ${schedule.description}`}
                  onClick={() => stopRecurringTransaction(schedule.id)}>Stop recurring</button>
              </article>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
