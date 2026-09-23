import { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

const navigation = [
  { to: "/", label: "Dashboard", path: "M3 10 12 3l9 7v11h-6v-7H9v7H3Z" },
  { to: "/accounts", label: "Accounts", path: "M3 6h17v15H3V6Zm0 0V3h14v3m-2 6h6v5h-6v-5Z" },
  { to: "/transactions", label: "Transactions", path: "M4 7h16m-5-5 5 5-5 5M20 17H4m5-5-5 5 5 5" },
  { to: "/budgets", label: "Budgets", path: "M4 21V11h4v10H4Zm6 0V3h4v18h-4Zm6 0V7h4v14h-4Z" },
];

export default function AppLayout() {
  const [menuOpen, setMenuOpen] = useState(true);

  return (
    <div className={`app-layout${menuOpen ? "" : " app-layout-collapsed"}`}>
      <aside className="sidebar">
        <div className="sidebar-brand">
          <span className="sidebar-logo" aria-hidden="true">BT</span>
          {menuOpen && <span className="sidebar-title">Budget Tracker</span>}
        </div>
        <button
          className="sidebar-toggle"
          type="button"
          aria-label={menuOpen ? "Collapse menu" : "Expand menu"}
          aria-expanded={menuOpen}
          aria-controls="app-navigation"
          title={menuOpen ? "Collapse menu" : "Expand menu"}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d={menuOpen ? "m14 6-6 6 6 6" : "m10 6 6 6-6 6"} />
          </svg>
        </button>
        <nav className="sidebar-nav" id="app-navigation" aria-label="Main navigation">
          {navigation.map(({ to, label, path }) => (
            <NavLink key={to} to={to} end={to === "/"} aria-label={label} title={menuOpen ? undefined : label}>
              <svg className="sidebar-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d={path} />
              </svg>
              {menuOpen && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="app-content"><Outlet /></div>
    </div>
  );
}
