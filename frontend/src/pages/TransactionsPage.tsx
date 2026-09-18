import { Link } from "react-router-dom";
import { useFinance } from "../context/FinanceContext";
import TransactionList from "../components/TransactionList";

export default function TransactionsPage() {
  const { accounts, transactions } = useFinance();

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
    </main>
  );
}
