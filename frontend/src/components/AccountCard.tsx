import { Link } from "react-router-dom";
import { formatCurrency } from "../utils/currency";
import type { Account } from "../types/Account";

interface AccountCardProps {
  account: Account;
  currentBalance: number;
  onDelete: (accountId: string) => void
}

export default function AccountCard({ account, currentBalance }: AccountCardProps) {
  const formattedBalance = formatCurrency(currentBalance);

  return (
    <Link
      className="card account-card account-card-link"
      to={`/accounts/${account.id}`}
    >
      <h3 className="card-title">{account.name}</h3>
      <p className="card-value">{formattedBalance}</p>
    </Link>
  );
}