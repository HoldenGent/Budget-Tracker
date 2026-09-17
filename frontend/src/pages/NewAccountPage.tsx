import { Link, useNavigate } from "react-router-dom";
import AccountForm from "../components/AccountForm";
import { useFinance } from "../context/FinanceContext";

export default function NewAccountPage() {
  const { addAccount } = useFinance();
  const navigate = useNavigate();

  return (
    <main className="page">
      <header className="page-header">
        <Link to="/accounts">← Back to accounts</Link>
        <h1 className="page-title">New account</h1>
      </header>
      <AccountForm
        onAdd={(account) => {
          addAccount(account);
          navigate("/accounts");
        }}
      />
    </main>
  );
}
