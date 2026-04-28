import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  BarChart3,
  CheckCircle2,
  Code2,
  Languages,
  TrendingUp,
  UserRound,
  XCircle,
} from "lucide-react";
import AdminLayout from "../components/admin/AdminLayout";
import {
  subscribeAllCompilerLogs,
  type CompilerLog,
} from "../lib/compilerLogService";

type LanguageUsageItem = {
  language: string;
  label: string;
  count: number;
  success: number;
  failed: number;
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
 * formatDate
 *
 * Purpose:
 * Safely formats Firestore timestamps for display.
 */
const formatDate = (log: CompilerLog) => {
  if (!log.createdAt) return "Unknown time";

  return log.createdAt.toDate().toLocaleString();
};

/**
 * AdminAnalytics
 *
 * Purpose:
 * Shows compiler-focused analytics using realtime compilerLogs data.
 * This page avoids repeating User Management controls.
 */
export default function AdminAnalytics() {
  const [logs, setLogs] = useState<CompilerLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);

    const unsubscribe = subscribeAllCompilerLogs((logsData) => {
      setLogs(logsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const totalRuns = logs.length;

  const successfulRuns = useMemo(
    () => logs.filter((log) => log.status === "success").length,
    [logs]
  );

  const failedRuns = useMemo(
    () => logs.filter((log) => log.status === "failed").length,
    [logs]
  );

  const successRate =
    totalRuns === 0 ? 0 : Math.round((successfulRuns / totalRuns) * 100);

  const runsToday = useMemo(() => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    return logs.filter((log) => {
      if (!log.createdAt) return false;
      return log.createdAt.toDate() >= startOfToday;
    }).length;
  }, [logs]);

  const languageUsage: LanguageUsageItem[] = useMemo(() => {
    return supportedLanguages.map((language) => {
      const languageLogs = logs.filter((log) => log.language === language);

      return {
        language,
        label: languageLabels[language] || language,
        count: languageLogs.length,
        success: languageLogs.filter((log) => log.status === "success").length,
        failed: languageLogs.filter((log) => log.status === "failed").length,
      };
    });
  }, [logs]);

  const activeLanguages = useMemo(
    () => languageUsage.filter((item) => item.count > 0),
    [languageUsage]
  );

  const mostUsedLanguage = useMemo(() => {
    if (languageUsage.length === 0) return null;

    return languageUsage.reduce((highest, current) =>
      current.count > highest.count ? current : highest
    );
  }, [languageUsage]);

  const recentFailedExecutions = useMemo(
    () => logs.filter((log) => log.status === "failed").slice(0, 6),
    [logs]
  );

  const topUsers = useMemo(() => {
    const userMap = new Map<
      string,
      {
        email: string;
        total: number;
        success: number;
        failed: number;
      }
    >();

    logs.forEach((log) => {
      const email = log.email || "Unknown user";
      const current = userMap.get(email) || {
        email,
        total: 0,
        success: 0,
        failed: 0,
      };

      current.total += 1;

      if (log.status === "success") {
        current.success += 1;
      } else {
        current.failed += 1;
      }

      userMap.set(email, current);
    });

    return Array.from(userMap.values())
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
  }, [logs]);

  const statCards = [
    {
      label: "Total Runs",
      value: loading ? "..." : totalRuns.toString(),
      helper: "All compiler executions",
      icon: Code2,
    },
    {
      label: "Success Rate",
      value: loading ? "..." : `${successRate}%`,
      helper: "Successful runs overall",
      icon: CheckCircle2,
    },
    {
      label: "Failed Runs",
      value: loading ? "..." : failedRuns.toString(),
      helper: "Runs with errors",
      icon: XCircle,
    },
    {
      label: "Runs Today",
      value: loading ? "..." : runsToday.toString(),
      helper: "Executions since midnight",
      icon: Activity,
    },
  ];

  return (
    <AdminLayout
      title="Analytics"
      subtitle="Analyze compiler usage, language popularity, success rates, and execution failures."
    >
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-xs font-bold uppercase tracking-widest text-emerald-600">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Live Analytics
          </span>

          <span className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-4 py-2 text-xs font-bold uppercase tracking-widest text-indigo-600">
            <BarChart3 size={14} />
            Compiler Logs
          </span>
        </div>

        <div className="rounded-full bg-slate-100 px-4 py-2 text-xs font-bold uppercase tracking-widest text-slate-500">
          {loading ? "Loading..." : `${activeLanguages.length} active language(s)`}
        </div>
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

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-slate-950">
                Language Usage
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Run distribution for every compiler language.
              </p>
            </div>

            <Languages className="text-indigo-600" size={24} />
          </div>

          <div className="mt-6 space-y-4">
            {languageUsage.map((item) => {
              const percentage =
                totalRuns === 0
                  ? 0
                  : Math.round((item.count / totalRuns) * 100);

              return (
                <div key={item.language} className="rounded-2xl bg-slate-50 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-slate-800">
                        {item.label}
                      </p>
                      <p className="mt-1 text-xs font-semibold text-slate-400">
                        {item.success} success · {item.failed} failed
                      </p>
                    </div>

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
                    {percentage}% of total executions
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-slate-950">
                  Status Breakdown
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Success vs failed executions.
                </p>
              </div>

              <TrendingUp className="text-indigo-600" size={24} />
            </div>

            <div className="mt-6 flex justify-center">
              <div className="flex h-44 w-44 items-center justify-center rounded-full border-[18px] border-indigo-600 bg-white">
                <div className="text-center">
                  <p className="text-4xl font-black text-slate-950">
                    {loading ? "..." : `${successRate}%`}
                  </p>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
                    Success
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between rounded-2xl bg-emerald-50 px-4 py-3">
                <span className="text-sm font-bold text-emerald-700">
                  Successful Runs
                </span>
                <span className="text-sm font-black text-emerald-700">
                  {successfulRuns}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-2xl bg-red-50 px-4 py-3">
                <span className="text-sm font-bold text-red-700">
                  Failed Runs
                </span>
                <span className="text-sm font-black text-red-700">
                  {failedRuns}
                </span>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-slate-950">
                  Top Active Users
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  Ranked by compiler executions.
                </p>
              </div>

              <UserRound className="text-indigo-600" size={24} />
            </div>

            <div className="mt-6 space-y-3">
              {topUsers.map((user, index) => (
                <div
                  key={user.email}
                  className="flex items-center justify-between gap-4 rounded-2xl bg-slate-50 px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-800">
                      #{index + 1} {user.email}
                    </p>
                    <p className="mt-1 text-xs font-semibold text-slate-400">
                      {user.success} success · {user.failed} failed
                    </p>
                  </div>

                  <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600">
                    {user.total}
                  </span>
                </div>
              ))}

              {!loading && topUsers.length === 0 && (
                <div className="rounded-2xl bg-slate-50 px-4 py-8 text-center text-sm font-semibold text-slate-500">
                  No user activity yet.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">
          <div>
            <h3 className="text-lg font-black text-slate-950">
              Recent Failed Executions
            </h3>
            <p className="mt-1 text-sm text-slate-500">
              Latest errors that may need attention.
            </p>
          </div>

          <XCircle className="text-red-500" size={22} />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-left">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-widest text-slate-400">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Language</th>
                <th className="px-6 py-4">File</th>
                <th className="px-6 py-4">Error</th>
                <th className="px-6 py-4">Time</th>
              </tr>
            </thead>

            <tbody>
              {recentFailedExecutions.map((log) => (
                <tr
                  key={log.id}
                  className="border-b border-slate-100 last:border-0"
                >
                  <td className="px-6 py-4 font-semibold text-slate-900">
                    {log.email || "Unknown user"}
                  </td>

                  <td className="px-6 py-4 text-sm font-semibold text-slate-600">
                    {languageLabels[log.language] || log.language}
                  </td>

                  <td className="px-6 py-4 font-mono text-sm text-slate-600">
                    {log.fileName}
                  </td>

                  <td className="max-w-[360px] truncate px-6 py-4 text-sm text-red-600">
                    {log.error || "Execution failed"}
                  </td>

                  <td className="px-6 py-4 text-sm text-slate-500">
                    {formatDate(log)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {!loading && recentFailedExecutions.length === 0 && (
            <div className="py-8 text-center text-sm font-semibold text-slate-500">
              No failed executions found.
            </div>
          )}
        </div>
      </section>
    </AdminLayout>
  );
}