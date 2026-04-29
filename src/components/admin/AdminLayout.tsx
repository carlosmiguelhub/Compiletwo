import {
  BarChart3,
  Bell,
  Code2,
  Gauge,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Menu,
  Search,
  Settings,
  Shield,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/config";

type AdminLayoutProps = {
  children: React.ReactNode;
  title: string;
  subtitle?: string;
};

/**
 * AdminLayout
 *
 * Purpose:
 * Reusable admin shell for all admin pages.
 * Includes desktop sidebar, mobile burger menu, topbar, search bar,
 * and page content wrapper.
 */
export default function AdminLayout({
  children,
  title,
  subtitle,
}: AdminLayoutProps) {
  const navigate = useNavigate();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  const navItems = [
    {
      label: "Dashboard",
      to: "/admin",
      icon: LayoutDashboard,
    },
    {
      label: "User Management",
      to: "/admin/users",
      icon: Users,
    },
    {
      label: "Analytics",
      to: "/admin/analytics",
      icon: BarChart3,
    },
    {
      label: "Settings",
      to: "/admin/settings",
      icon: Settings,
    },
  ];

  /**
   * handleLogout
   * Signs out the admin and redirects back to login.
   */
  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const renderNavLinks = (onClick?: () => void) => (
    <nav className="mt-4 flex-1 space-y-1 px-3">
      {navItems.map((item) => {
        const Icon = item.icon;

        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/admin"}
            onClick={onClick}
            className={({ isActive }) =>
              [
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition",
                isActive
                  ? "bg-indigo-50 text-indigo-600 shadow-sm"
                  : "text-slate-600 hover:bg-slate-50 hover:text-indigo-600",
              ].join(" ")
            }
          >
            <Icon size={19} />
            {item.label}
          </NavLink>
        );
      })}
    </nav>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      {/* Desktop sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 border-r border-slate-200 bg-white lg:block">
        <div className="flex h-full flex-col">
          <Link to="/admin" className="flex items-center gap-3 px-6 py-6">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
              <Shield size={24} />
            </div>

            <div>
              <h1 className="text-lg font-bold leading-none text-indigo-600">
                CompiloAdmin
              </h1>
              <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Admin Suite
              </p>
            </div>
          </Link>

          {renderNavLinks()}

          <div className="space-y-1 border-t border-slate-100 px-3 py-5">
            <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-indigo-600">
              <HelpCircle size={19} />
              Support
            </button>

            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-500 transition hover:bg-red-50"
            >
              <LogOut size={19} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile dark overlay */}
      {mobileSidebarOpen && (
        <button
          type="button"
          aria-label="Close admin menu overlay"
          onClick={() => setMobileSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Mobile sidebar drawer */}
      <aside
        className={[
          "fixed left-0 top-0 z-50 h-screen w-72 max-w-[85vw] border-r border-slate-200 bg-white shadow-2xl transition-transform duration-300 lg:hidden",
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-5 py-5">
            <Link
              to="/admin"
              onClick={() => setMobileSidebarOpen(false)}
              className="flex items-center gap-3"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/20">
                <Shield size={24} />
              </div>

              <div>
                <h1 className="text-lg font-bold leading-none text-indigo-600">
                  CompiloAdmin
                </h1>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                  Admin Suite
                </p>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => setMobileSidebarOpen(false)}
              className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
              aria-label="Close admin menu"
            >
              <X size={22} />
            </button>
          </div>

          {renderNavLinks(() => setMobileSidebarOpen(false))}

          <div className="space-y-1 border-t border-slate-100 px-3 py-5">
            <button className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 hover:text-indigo-600">
              <HelpCircle size={19} />
              Support
            </button>

            <button
              onClick={handleLogout}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-red-500 transition hover:bg-red-50"
            >
              <LogOut size={19} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="flex h-16 items-center justify-between gap-3 px-4 sm:px-6 lg:px-8">
            {/* Mobile burger button */}
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-100 lg:hidden"
              aria-label="Open admin menu"
            >
              <Menu size={22} />
            </button>

            <div className="flex min-w-0 flex-1 items-center gap-3 rounded-xl bg-slate-100 px-3 py-2.5 text-slate-500 sm:max-w-md sm:px-4">
              <Search size={18} className="shrink-0" />
              <input
                type="text"
                placeholder="Search admin..."
                className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
            </div>

            <div className="flex shrink-0 items-center gap-2 sm:gap-4">
              <button className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900">
                <Bell size={20} />
              </button>

              <div className="hidden h-8 w-px bg-slate-200 sm:block" />

              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                  <Code2 size={20} />
                </div>

                <div className="hidden sm:block">
                  <p className="text-sm font-bold text-slate-900">Admin</p>
                  <p className="text-xs text-slate-500">Administrator</p>
                </div>
              </div>
            </div>
          </div>
        </header>

        <main className="px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-7">
            <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-indigo-600">
              <Gauge size={14} />
              Admin Portal
            </div>

            <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950">
              {title}
            </h2>

            {subtitle && (
              <p className="mt-2 max-w-2xl text-sm text-slate-500">
                {subtitle}
              </p>
            )}
          </div>

          {children}
        </main>
      </div>
    </div>
  );
}