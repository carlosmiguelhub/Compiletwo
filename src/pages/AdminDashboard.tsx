import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  CheckCircle2,
  Code2,
  Database,
  Gauge,
  ShieldCheck,
  UserCheck,
  Users,
  XCircle,
} from "lucide-react";
import { Link } from "react-router-dom";
import AdminLayout from "../components/admin/AdminLayout";
import { subscribeAllUsers } from "../lib/userService";
import type { AppUser } from "../types/user";
import {
  subscribeAllCompilerLogs,
  subscribeRecentCompilerLogs,
  type CompilerLog,
} from "../lib/compilerLogService";

type UserRole = "user" | "admin";

type LanguageUsageItem = {
  language: string;
  label: string;
  count: number;
};

/**
 * normalizeRole
 *
 * Purpose:
 * Makes sure role values are safely handled as "user" or "admin".
 */
const normalizeRole = (role?: string): UserRole => {
  return role?.toLowerCase() === "admin" ? "admin" : "user";
};

const languageLabels: Record<string, string> = {
  javascript: "JavaScript",
  typescript: "TypeScript",
  python: "Python",
  java: "Java",
  c: "C",
  cpp: "C++",
  csharp: "C#",
  php: "PHP",
  sql: "SQL",
  html: "HTML",
  css: "CSS",
};

const supportedLanguages = [
  "javascript",
  "typescript",
  "python",
  "java",
  "c",
  "cpp",
  "csharp",
  "php",
  "sql",
  "html",
  "css",
];

/**
 * AdminDashboard
 *
 * Purpose:
 * Main dashboard for admin users.
 * Uses realtime Firestore listeners for users and compiler logs.
 */
export default function AdminDashboard() {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [logs, setLogs] = useState<CompilerLog[]>([]);
  const [recentLogs, setRecentLogs] = useState<CompilerLog[]>([]);
  const [loading, setLoading] = useState(true);

  /**
   * Realtime dashboard listeners.
   *
   * These update automatically when:
   * - a user registers
   * - a user's role changes
   * - a compiler log is created
   */
  useEffect(() => {
    setLoading(true);

    const unsubscribeUsers = subscribeAllUsers((usersData) => {
      setUsers(usersData);
      setLoading(false);
    });

    const unsubscribeLogs = subscribeAllCompilerLogs((logsData) => {
      setLogs(logsData);
    });

    const unsubscribeRecentLogs = subscribeRecentCompilerLogs(
      5,
      (recentLogsData) => {
        setRecentLogs(recentLogsData);
      }
    );

    return () => {
      unsubscribeUsers();
      unsubscribeLogs();
      unsubscribeRecentLogs();
    };
  }, []);

  const totalUsers = users.length;
  const totalRuns = logs.length;

  const verifiedUsers = useMemo(
    () => users.filter((user) => user.emailVerified).length,
    [users]
  );

  const adminUsers = useMemo(
    () => users.filter((user) => normalizeRole(user.role) === "admin").length,
    [users]
  );

  const normalUsers = useMemo(
    () => users.filter((user) => normalizeRole(user.role) === "user").length,
    [users]
  );

  const runsToday = useMemo(() => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    return logs.filter((log) => {
      if (!log.createdAt) return false;
      return log.createdAt.toDate() >= startOfToday;
    }).length;
  }, [logs]);

  const failedRuns = useMemo(
    () => logs.filter((log) => log.status === "failed").length,
    [logs]
  );

  const successfulRuns = useMemo(
    () => logs.filter((log) => log.status === "success").length,
    [logs]
  );

  const sqlRuns = useMemo(
    () => logs.filter((log) => log.language === "sql").length,
    [logs]
  );

  const successRate =
    totalRuns === 0 ? 0 : Math.round((successfulRuns / totalRuns) * 100);

  const languageUsage: LanguageUsageItem[] = useMemo(() => {
    return supportedLanguages.map((language) => {
      const count = logs.filter((log) => log.language === language).length;

      return {
        language,
        label: languageLabels[language] || language,
        count,
      };
    });
  }, [logs]);

  const mostUsedLanguage = useMemo(() => {
    if (languageUsage.length === 0) return null;

    return languageUsage.reduce((highest, current) =>
      current.count > highest.count ? current : highest
    );
  }, [languageUsage]);

  const statCards = [
    {
      label: "Total Users",
      value: loading ? "..." : totalUsers.toString(),
      helper: "Registered accounts",
      icon: Users,
    },
    {
      label: "Code Runs Today",
      value: loading ? "..." : runsToday.toString(),
      helper: "Compiler executions today",
      icon: Code2,
    },
    {
      label: "Failed Runs",
      value: loading ? "..." : failedRuns.toString(),
      helper: "Runs with errors",
      icon: XCircle,
    },
    {
      label: "SQL Runs",
      value: loading ? "..." : sqlRuns.toString(),
      helper: "SQL sandbox executions",
      icon: Database,
    },
  ];

  const recentExecutions = recentLogs;

  return (
    <AdminLayout
      title="Admin Dashboard"
      subtitle="Monitor live users, compiler activity, language usage, SQL runs, and recent executions."
    >
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-xs font-bold uppercase tracking-widest text-emerald-600">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Live Updating
          </span>

          <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-xs font-bold uppercase tracking-widest text-indigo-600">
            <Gauge size={14} />
            Firestore Connected
          </span>
        </div>

        <Link
          to="/admin/users"
          className="inline-flex justify-center rounded-xl bg-indigo-600 px-4 py-2 text-sm font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700"
        >
          Manage Users
        </Link>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.label}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <Icon size={22} />
                </div>

                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-600">
                  Live
                </span>
              </div>

              <p className="mt-5 text-sm font-semibold text-slate-500">
                {card.label}
              </p>

              <h3 className="mt-1 text-3xl font-black text-slate-950">
                {card.value}
              </h3>

              <p className="mt-2 text-xs text-slate-400">{card.helper}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.25fr_1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-slate-950">
                User Overview
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Live summary from your Firestore users collection.
              </p>
            </div>

            <ShieldCheck className="text-indigo-600" size={24} />
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl bg-slate-50 p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-500">
                  Verified Users
                </p>
                <UserCheck size={18} className="text-emerald-600" />
              </div>
              <p className="mt-2 text-3xl font-black text-slate-950">
                {loading ? "..." : verifiedUsers}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Users who have verified their email.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-500">
                  Unverified Users
                </p>
                <XCircle size={18} className="text-amber-600" />
              </div>
              <p className="mt-2 text-3xl font-black text-slate-950">
                {loading ? "..." : totalUsers - verifiedUsers}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Users who still need email verification.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-500">
                  Admin Accounts
                </p>
                <ShieldCheck size={18} className="text-indigo-600" />
              </div>
              <p className="mt-2 text-3xl font-black text-slate-950">
                {loading ? "..." : adminUsers}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Users with admin route access.
              </p>
            </div>

            <div className="rounded-2xl bg-slate-50 p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-slate-500">
                  Standard Accounts
                </p>
                <Users size={18} className="text-slate-600" />
              </div>
              <p className="mt-2 text-3xl font-black text-slate-950">
                {loading ? "..." : normalUsers}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Users with normal compiler access.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-slate-950">
                Compiler Metrics
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Live summary from your compilerLogs collection.
              </p>
            </div>

            <BarChart3 className="text-indigo-600" size={24} />
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <Code2 className="text-indigo-600" size={20} />
                <span className="text-sm font-bold text-slate-700">
                  Total Code Runs
                </span>
              </div>
              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600">
                {loading ? "..." : totalRuns}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="text-emerald-600" size={20} />
                <span className="text-sm font-bold text-slate-700">
                  Success Rate
                </span>
              </div>
              <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-600">
                {loading ? "..." : `${successRate}%`}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
              <div className="flex items-center gap-3">
                <Activity className="text-violet-600" size={20} />
                <span className="text-sm font-bold text-slate-700">
                  Most Used
                </span>
              </div>
              <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold text-violet-600">
                {loading
                  ? "..."
                  : mostUsedLanguage && mostUsedLanguage.count > 0
                  ? mostUsedLanguage.label
                  : "None"}
              </span>
            </div>
          </div>
        </section>
      </div>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-black text-slate-950">
              Language Usage
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Live run counts for every language available in the compiler.
            </p>
          </div>

          <Code2 className="text-indigo-600" size={24} />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {languageUsage.map((item) => {
            const percentage =
              totalRuns === 0 ? 0 : Math.round((item.count / totalRuns) * 100);

            return (
              <div key={item.language} className="rounded-2xl bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-bold text-slate-700">
                    {item.label}
                  </span>

                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600">
                    {loading ? "..." : item.count}
                  </span>
                </div>

                <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-indigo-600 transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <p className="mt-2 text-xs font-semibold text-slate-400">
                  {percentage}% of total runs
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h3 className="text-lg font-black text-slate-950">
              Recent Code Executions
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Latest compiler activity from Firestore.
            </p>
          </div>

          <Activity className="text-indigo-600" size={22} />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-widest text-slate-400">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Language</th>
                <th className="px-6 py-4">File</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>

            <tbody>
              {recentExecutions.map((log) => (
                <tr
                  key={log.id}
                  className="border-b border-slate-100 last:border-0"
                >
                  <td className="px-6 py-4 font-semibold text-slate-900">
                    {log.email || "Unknown user"}
                  </td>

                  <td className="px-6 py-4 text-sm font-semibold capitalize text-slate-600">
                    {languageLabels[log.language] || log.language}
                  </td>

                  <td className="px-6 py-4 font-mono text-sm text-slate-600">
                    {log.fileName}
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={[
                        "rounded-full px-3 py-1 text-xs font-bold capitalize",
                        log.status === "success"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-red-50 text-red-600",
                      ].join(" ")}
                    >
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!loading && recentExecutions.length === 0 && (
            <div className="py-8 text-center text-sm font-semibold text-slate-500">
              No compiler logs found yet.
            </div>
          )}
        </div>
      </section>
    </AdminLayout>
  );
}