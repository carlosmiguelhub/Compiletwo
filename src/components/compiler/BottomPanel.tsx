type BottomTab = "output" | "problems" | "input";

type BottomPanelProps = {
  activeTab: BottomTab;
  output: string[];
  problems: string[];
  stdin: string;
  onChangeTab: (tab: BottomTab) => void;
  onStdinChange: (value: string) => void;
  onClearOutput?: () => void;
  collapsed?: boolean;
  height?: number;
  onToggleCollapse?: () => void;
  onResizeStart?: () => void;
};

export default function BottomPanel({
  activeTab,
  output,
  problems,
  stdin,
  onChangeTab,
  onStdinChange,
  onClearOutput,
  collapsed = false,
  height = 220,
  onToggleCollapse,
  onResizeStart,
}: BottomPanelProps) {
  const panelBodyHeight = `calc(${height}px - 49px)`;

  const renderOutput = (lines: string[]) => {
    if (lines.length === 0) {
      return (
        <div className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted-foreground">
          No output yet.
        </div>
      );
    }

    return (
      <div className="rounded-xl border border-border bg-background px-3 py-3 font-mono text-sm text-foreground whitespace-pre-wrap break-words overflow-auto">
        {lines.join("\n")}
      </div>
    );
  };

  const renderProblems = (lines: string[]) => {
    if (lines.length === 0) {
      return (
        <div className="rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted-foreground">
          No problems yet.
        </div>
      );
    }

    return (
      <div className="space-y-2 font-mono text-sm">
        {lines.map((line, index) => (
          <div
            key={`${line}-${index}`}
            className="rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-foreground whitespace-pre-wrap break-words"
          >
            {line}
          </div>
        ))}
      </div>
    );
  };

  const renderInput = () => (
    <div className="space-y-3">
      <div className="rounded-lg border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
        Standard input for your program. This will be sent when you run the active file.
      </div>

      <textarea
        value={stdin}
        onChange={(e) => onStdinChange(e.target.value)}
        placeholder="Type your program input here..."
        className="min-h-[140px] w-full resize-none rounded-xl border border-border bg-background px-3 py-3 font-mono text-sm text-foreground outline-none transition focus:border-primary"
      />
    </div>
  );

  return (
    <div
      className="relative border-t border-border bg-card/60 transition-[height] duration-200"
      style={{ height: collapsed ? 49 : height }}
    >
      {!collapsed && (
        <div
          onMouseDown={onResizeStart}
          className="absolute inset-x-0 top-0 z-10 hidden h-2 cursor-row-resize lg:block"
          title="Drag to resize terminal"
        >
          <div className="mx-auto mt-[2px] h-1 w-16 rounded-full bg-border transition hover:bg-primary" />
        </div>
      )}

      <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
        <div className="flex items-center gap-2 lg:hidden">
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

          <button
            onClick={() => onChangeTab("input")}
            className={`rounded-lg px-3 py-1.5 font-mono text-sm transition ${
              activeTab === "input"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            Input
          </button>
        </div>

        <div className="hidden lg:flex items-center gap-2 font-mono text-sm text-muted-foreground">
          <span className="rounded-md border border-border bg-background px-2 py-1">
            Output
          </span>
          <span className="text-border">|</span>
          <span className="rounded-md border border-border bg-background px-2 py-1">
            Problems
          </span>
          <span className="text-border">|</span>
          <span className="rounded-md border border-border bg-background px-2 py-1">
            Input
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onClearOutput && (
            <button
              onClick={onClearOutput}
              className="rounded-lg border border-border bg-background px-3 py-1.5 font-mono text-sm text-muted-foreground transition hover:border-primary hover:text-primary"
            >
              Clear Output
            </button>
          )}

          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="hidden lg:inline-flex rounded-lg border border-border bg-background px-3 py-1.5 font-mono text-sm text-muted-foreground transition hover:border-primary hover:text-primary"
            >
              {collapsed ? "Expand Terminal" : "Collapse Terminal"}
            </button>
          )}
        </div>
      </div>

      {!collapsed && (
        <>
          <div
            className="overflow-y-auto px-4 py-3 lg:hidden"
            style={{ height: panelBodyHeight }}
          >
            {activeTab === "output" && renderOutput(output)}
            {activeTab === "problems" && renderProblems(problems)}
            {activeTab === "input" && renderInput()}
          </div>

          <div
            className="hidden lg:grid lg:grid-cols-3"
            style={{ height: panelBodyHeight }}
          >
            <section className="min-h-0 border-r border-border px-4 py-3">
              <div className="mb-3 font-mono text-xs uppercase tracking-wide text-muted-foreground">
                Output
              </div>
              <div className="h-full overflow-y-auto pr-1">
                {renderOutput(output)}
              </div>
            </section>

            <section className="min-h-0 border-r border-border px-4 py-3">
              <div className="mb-3 font-mono text-xs uppercase tracking-wide text-muted-foreground">
                Problems
              </div>
              <div className="h-full overflow-y-auto pr-1">
                {renderProblems(problems)}
              </div>
            </section>

            <section className="min-h-0 px-4 py-3">
              <div className="mb-3 font-mono text-xs uppercase tracking-wide text-muted-foreground">
                Input
              </div>
              <div className="h-full overflow-y-auto pr-1">{renderInput()}</div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}