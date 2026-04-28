import {
  Download,
  Menu,
  Moon,
  Play,
  Save,
  Sun,
  ExternalLink,
  MonitorSmartphone,
} from "lucide-react";
import { useEffect, useState } from "react";

type TopbarProps = {
  isRunning: boolean;
  showPreviewButton?: boolean;
  showSqlResultsButton?: boolean;
  showShowTablesButton?: boolean;
  showJavaGuiButton?: boolean;
  disableRun?: boolean;
  onSave: () => void;
  onRun: () => void;
  onRunJavaGui?: () => void;
  onPreviewHtml?: () => void;
  onOpenSqlResults?: () => void;
  onShowTables?: () => void;
  onDownload: () => void;
  onToggleExplorer: () => void;
};

export default function Topbar({
  isRunning,
  showPreviewButton = false,
  showSqlResultsButton = false,
  showShowTablesButton = false,
  showJavaGuiButton = false,
  disableRun = false,
  onSave,
  onRun,
  onRunJavaGui,
  onPreviewHtml,
  onOpenSqlResults,
  onShowTables,
  onDownload,
  onToggleExplorer,
}: TopbarProps) {
  const [isDark, setIsDark] = useState(false);

  /**
   * On first load:
   * - check saved theme
   * - fall back to system/browser preference
   * - apply dark class to the document
   */
  useEffect(() => {
    const savedTheme = localStorage.getItem("judge-compilo-theme");
    const prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    const shouldUseDark = savedTheme
      ? savedTheme === "dark"
      : document.documentElement.classList.contains("dark") || prefersDark;

    document.documentElement.classList.toggle("dark", shouldUseDark);
    setIsDark(shouldUseDark);
  }, []);

  /**
   * Toggle between dark and light mode
   * and persist the choice in localStorage.
   */
  const toggleTheme = () => {
    const nextIsDark = !isDark;
    document.documentElement.classList.toggle("dark", nextIsDark);
    localStorage.setItem("judge-compilo-theme", nextIsDark ? "dark" : "light");
    setIsDark(nextIsDark);
  };

  return (
    <div className="border-b border-border bg-card/70 backdrop-blur">
      <div className="flex flex-col gap-3 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <button
            onClick={onToggleExplorer}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background transition hover:border-primary hover:text-primary lg:hidden"
            title="Open explorer"
          >
            <Menu className="h-4 w-4" />
          </button>

          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/30 bg-primary/10 font-mono text-primary shadow-sm">
            {"</>"}
          </div>

          <div className="min-w-0">
            <p className="truncate font-mono">Code Workspace</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onSave}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-background px-3 font-mono text-sm transition hover:border-primary hover:text-primary"
          >
            <Save className="h-4 w-4" />
            <span className="hidden sm:inline">Save</span>
          </button>

          <button
            onClick={onDownload}
            className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-background px-3 font-mono text-sm transition hover:border-primary hover:text-primary"
          >
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Download</span>
          </button>

          {showPreviewButton && onPreviewHtml && (
            <button
              onClick={onPreviewHtml}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-background px-3 font-mono text-sm transition hover:border-primary hover:text-primary"
              title="Open web preview in a new tab"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="hidden sm:inline">Preview</span>
            </button>
          )}

          {showShowTablesButton && onShowTables && (
            <button
              onClick={onShowTables}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-background px-3 font-mono text-sm transition hover:border-primary hover:text-primary"
              title="Show tables in your SQL sandbox"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="hidden sm:inline">Tables</span>
            </button>
          )}

          {showSqlResultsButton && onOpenSqlResults && (
            <button
              onClick={onOpenSqlResults}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-background px-3 font-mono text-sm transition hover:border-primary hover:text-primary"
              title="Open SQL results"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="hidden sm:inline">Results</span>
            </button>
          )}

          {showJavaGuiButton && onRunJavaGui && (
            <button
              onClick={onRunJavaGui}
              disabled={isRunning}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-primary/30 bg-primary/10 px-3 font-mono text-sm font-semibold text-primary transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              title="Run Java Swing/AWT GUI in sandbox preview"
            >
              <MonitorSmartphone className="h-4 w-4" />
              <span className="hidden sm:inline">
                {isRunning ? "Running GUI..." : "Run GUI"}
              </span>
            </button>
          )}

          <button
            onClick={toggleTheme}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background transition hover:border-primary hover:text-primary"
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>

          <button
            onClick={onRun}
            disabled={isRunning || disableRun}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 font-mono text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            title={
              disableRun
                ? "This file type uses Preview instead of Run"
                : "Run code"
            }
          >
            <Play className="h-4 w-4" />
            {isRunning ? "Running..." : "Run"}
          </button>
        </div>
      </div>
    </div>
  );
}