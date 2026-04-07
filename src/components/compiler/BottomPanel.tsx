type BottomPanelProps = {
  activeTab: "output" | "problems";
  output: string[];
  problems: string[];
  onChangeTab: (tab: "output" | "problems") => void;
};

export default function BottomPanel({
  activeTab,
  output,
  problems,
  onChangeTab,
}: BottomPanelProps) {
  const rows = activeTab === "output" ? output : problems;

  return (
    <div className="h-[220px] border-t border-border bg-card/60">
      <div className="flex items-center gap-2 border-b border-border px-3 py-2">
        <button
          onClick={() => onChangeTab("output")}
          className={`rounded-lg px-3 py-1.5 font-mono text-sm transition ${
            activeTab === "output"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          Output
        </button>

        <button
          onClick={() => onChangeTab("problems")}
          className={`rounded-lg px-3 py-1.5 font-mono text-sm transition ${
            activeTab === "problems"
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          Problems
        </button>
      </div>

      <div className="h-[calc(220px-49px)] overflow-y-auto px-4 py-3">
        <div className="space-y-2 font-mono text-sm">
          {rows.map((line, index) => (
            <div
              key={`${line}-${index}`}
              className={`rounded-lg border px-3 py-2 ${
                activeTab === "output"
                  ? "border-primary/20 bg-primary/5 text-foreground"
                  : "border-amber-500/20 bg-amber-500/5 text-foreground"
              }`}
            >
              {line}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}