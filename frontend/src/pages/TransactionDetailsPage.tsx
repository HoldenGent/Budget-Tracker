import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import TransactionForm from "../components/TransactionForm";
import { useFinance } from "../context/FinanceContext";

export default function TransactionDetailsPage() {
  const { transactionId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { accounts, transactions, updateTransaction, deleteTransaction, convertToRecurring } = useFinance();
  const transaction = transactions.find((item) => item.id === transactionId);

  // Only return to an existing account page; direct links fall back to history.
  const requestedReturnTo = location.state?.returnTo;
  const returnAccount = accounts.find(
    (account) => `/accounts/${account.id}` === requestedReturnTo,
  );
  const returnTo = returnAccount ? `/accounts/${returnAccount.id}` : "/transactions";
  const backLabel = returnAccount ? "Back to account" : "Back to transactions";

  if (!transaction) {
    return (
      <main className="page">
        <h1 className="page-title">Transaction not found</h1>
        <p>This transaction may have been deleted or the link may be invalid.</p>
        <Link to={returnTo}>{backLabel}</Link>
      </main>
    );
  }

  return (
    <main className="page">
      <header className="page-header">
        <Link to={returnTo}>← {backLabel}</Link>
        <h1 className="page-title">{transaction.description}</h1>
        <p className="page-description">Review or update this transaction.</p>
      </header>
      <TransactionForm
        key={transaction.id}
        accounts={accounts}
        initialTransaction={transaction}
        onAdd={(updated, frequency) => {
          if (frequency) convertToRecurring(updated, frequency);
          else updateTransaction(updated);
          navigate(returnTo);
        }}
      />
      <button
        className="button transaction-delete"
        type="button"
        onClick={() => {
          deleteTransaction(transaction.id);
          navigate(returnTo);
        }}
      >
        Delete transaction
      </button>
    </main>
  );
}
