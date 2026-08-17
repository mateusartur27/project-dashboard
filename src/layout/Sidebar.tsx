import { useState } from "react";
import { NavLink } from "react-router-dom";
import { logout } from "../lib/auth";
import { ThemeToggle } from "../components/ThemeToggle";
import "./sidebar.css";

const STORAGE_KEY = "pd_sidebar_collapsed";

const NAV_ITEMS = [
  { to: "/", label: "Melhorias", icon: "✦", end: true },
  { to: "/modules", label: "Módulos", icon: "▦", end: false },
  { to: "/channels", label: "Canais", icon: "▶", end: false },
  { to: "/rules", label: "Regras", icon: "▤", end: false },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(STORAGE_KEY) === "1");

  function toggle() {
    setCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  }

  async function handleLogout() {
    await logout();
    window.location.assign("/login");
  }

  return (
    <aside className={`sidebar ${collapsed ? "sidebar-collapsed" : ""}`}>
      <div className="sidebar-brand">
        <span className="sidebar-brand-mark">◆</span>
        {!collapsed && <span>Painel de Sistemas</span>}
      </div>

      <nav className="sidebar-nav">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => `sidebar-link ${isActive ? "sidebar-link-active" : ""}`}
            title={collapsed ? item.label : undefined}
          >
            <span className="sidebar-link-icon">{item.icon}</span>
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <ThemeToggle collapsed={collapsed} />
        <button type="button" className="sidebar-toggle" onClick={toggle} title={collapsed ? "Expandir menu" : "Recolher menu"}>
          {collapsed ? "›" : "‹ Recolher"}
        </button>
        <button type="button" className="sidebar-logout" onClick={handleLogout} title="Sair">
          <span className="sidebar-link-icon">⏻</span>
          {!collapsed && <span>Sair</span>}
        </button>
      </div>
    </aside>
  );
}
