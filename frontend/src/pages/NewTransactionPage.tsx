import { Link, useNavigate } from "react-router-dom";
import TransactionForm from "../components/TransactionForm";
import { useFinance } from "../context/FinanceContext";

export default function NewTransactionPage() {
  const { accounts, addTransaction } = useFinance();
  const navigate = useNavigate();

  return (
    <main className="page">
      <header className="page-header">
        <Link to="/transactions">← Back to transactions</Link>
        <h1 className="page-title">New transaction</h1>
      </header>
      <TransactionForm
        accounts={accounts}
        onAdd={(transaction) => {
          addTransaction(transaction);
          navigate("/transactions");
        }}
      />
      {accounts.length === 0 && (
        <p className="page-section"><Link to="/accounts">Add an account</Link></p>
      )}
    </main>
  );
}
