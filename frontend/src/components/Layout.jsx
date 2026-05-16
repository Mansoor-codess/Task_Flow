import { BarChart3, FolderKanban, LogOut, Shield } from "lucide-react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Button from "./Button";

export default function Layout() {
  const { user, logout } = useAuth();
  const navClass = ({ isActive }) =>
    `inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-semibold ${
      isActive ? "bg-mint text-forest" : "text-ink/70 hover:bg-white"
    }`;

  return (
    <div className="min-h-screen">
      <header className="border-b border-ink/10 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link to="/dashboard" className="text-lg font-black text-forest">
            Team Task Manager
          </Link>
          <nav className="flex items-center gap-1">
            <NavLink to="/dashboard" className={navClass}>
              <BarChart3 size={17} />
              Dashboard
            </NavLink>
            <NavLink to="/projects" className={navClass}>
              <FolderKanban size={17} />
              Projects
            </NavLink>
            {user?.role === "ADMIN" ? (
              <NavLink to="/admin" className={navClass}>
                <Shield size={17} />
                Admin
              </NavLink>
            ) : null}
          </nav>
          <div className="flex items-center gap-3">
            <div className="text-right text-sm">
              <div className="font-semibold">{user?.name}</div>
              <div className="text-ink/55">{user?.role}</div>
            </div>
            <Button variant="secondary" onClick={logout} aria-label="Log out">
              <LogOut size={17} />
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  );
}
