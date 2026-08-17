import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import "./layout.css";

export function Layout() {
  return (
    <div className="shell">
      <Sidebar />
      <div className="shell-content">
        <main className="shell-main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
