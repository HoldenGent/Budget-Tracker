import { Link } from "react-router-dom";
import type { Account } from "../types/Account";

interface AccountCardProps {
  account: Account;
}

export default function AccountCard({ account }: AccountCardProps) {
  const formattedBalance = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(account.balance);

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