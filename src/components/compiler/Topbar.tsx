import { Download, Menu, Moon, Play, Save, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import type { CompilerLanguage } from "../../pages/CompilerWorkspace";

type TopbarProps = {
  language: CompilerLanguage;
  activeFileName: string;
  isRunning: boolean;
  onLanguageChange: (language: CompilerLanguage) => void;
  onSave: () => void;
  onRun: () => void;
  onDownload: () => void;
  onToggleExplorer: () => void;
};

/**
 * Language list for the topbar.
 *
 * NOTE:
 * Right now this array is not being rendered in the UI yet,
 * because there is no <select> in the returned JSX.
 *
 * I am still adding PHP here so this file stays aligned
 * with CompilerWorkspace and Judge0 service.
 */
const languages: { label: string; value: CompilerLanguage }[] = [
  { label: "Java", value: "java" },
  { label: "JavaScript", value: "javascript" },
  { label: "TypeScript", value: "typescript" },
  { label: "Python", value: "python" },
  { label: "C", value: "c" },
  { label: "C++", value: "cpp" },
  { label: "C#", value: "csharp" },
  { label: "PHP", value: "php" },
  { label: "SQL", value: "sql" },
  { label: "HTML", value: "html" },
];

export default function Topbar({
  language,
  isRunning,
  onLanguageChange,
  onSave,
  onRun,
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
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

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
            <p className="truncate font-mono">
              Code Workspace
            </p>

            {/*
              You can restore this later if you want the active file name shown.
            */}
            {/* <h1 className="truncate font-mono text-base font-semibold">
              {activeFileName}
            </h1> */}
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

          <button
            onClick={toggleTheme}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background transition hover:border-primary hover:text-primary"
            title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          <button
            onClick={onRun}
            disabled={isRunning}
            className="inline-flex h-10 items-center gap-2 rounded-xl bg-primary px-4 font-mono text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Play className="h-4 w-4" />
            {isRunning ? "Running..." : "Run"}
          </button>
        </div>
      </div>
    </div>
  );
}