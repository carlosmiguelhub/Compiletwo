import Editor from "@monaco-editor/react";
import { useEffect, useMemo, useState } from "react";
import type { CompilerLanguage } from "../../pages/CompilerWorkspace";

type EditorPanelProps = {
  fileName: string;
  language: CompilerLanguage;
  value: string;
  onChange: (value: string) => void;
};

function mapLanguage(language: CompilerLanguage) {
  switch (language) {
    case "cpp":
      return "cpp";
    case "csharp":
      return "csharp";
    case "javascript":
      return "javascript";
    case "typescript":
      return "typescript";
    case "python":
      return "python";
    case "java":
      return "java";
    case "c":
      return "c";
    case "php":
      return "php";
    case "sql":
      return "sql";
    case "html":
      return "html";
    default:
      return "plaintext";
  }
}
export default function EditorPanel({
  fileName,
  language,
  value,
  onChange,
}: EditorPanelProps) {
  const [isDark, setIsDark] = useState(
    document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDark(document.documentElement.classList.contains("dark"));
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  const monacoTheme = useMemo(() => {
    return isDark ? "vs-dark" : "light";
  }, [isDark]);

  return (
    <div className="min-h-0 flex-1 bg-background">
      <div className="flex h-full min-h-0 flex-col">
        <div className="flex items-center justify-between border-b border-border bg-card/40 px-3 py-2 sm:px-4">
          <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground sm:text-xs">
            Editor
          </div>
<div className="truncate font-mono text-[10px] text-primary sm:text-xs overflow-x-auto">
              {fileName || "No file selected"}
          </div>
        </div>

        <div className="min-h-0 flex-1">
          <Editor
            height="100%"
            language={mapLanguage(language)}
            value={value}
            theme={monacoTheme}
            onChange={(next) => onChange(next ?? "")}
            options={{
              fontFamily: "JetBrains Mono, monospace",
              fontSize: 13,
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              wordWrap: "off",
              tabSize: 2,
              padding: { top: 12 },
              smoothScrolling: true,

            }}
          />
        </div>
      </div>
    </div>
  );
}