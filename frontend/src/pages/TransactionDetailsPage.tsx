import { Link, useNavigate, useParams } from "react-router-dom";
import TransactionForm from "../components/TransactionForm";
import { useFinance } from "../context/FinanceContext";

export default function TransactionDetailsPage() {
  const { transactionId } = useParams();
  const navigate = useNavigate();
  const { accounts, transactions, updateTransaction, deleteTransaction } = useFinance();
  const transaction = transactions.find((item) => item.id === transactionId);

  if (!transaction) {
    return (
      <main className="page">
        <h1 className="page-title">Transaction not found</h1>
        <p>This transaction may have been deleted or the link may be invalid.</p>
        <Link to="/transactions">Back to transactions</Link>
      </main>
    );
  }

  return (
    <main className="page">
      <header className="page-header">
        <Link to="/transactions">← Back to transactions</Link>
        <h1 className="page-title">{transaction.description}</h1>
        <p className="page-description">Review or update this transaction.</p>
      </header>
      <TransactionForm
        key={transaction.id}
        accounts={accounts}
        initialTransaction={transaction}
        onAdd={(updated) => {
          updateTransaction(updated);
          navigate("/transactions");
        }}
      />
      <button
        className="button transaction-delete"
        type="button"
        onClick={() => {
          deleteTransaction(transaction.id);
          navigate("/transactions");
        }}
      >
        Delete transaction
      </button>
    </main>
  );
}
