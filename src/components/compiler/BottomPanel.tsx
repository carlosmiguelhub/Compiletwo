type BottomPanelProps = {
  activeTab: "output" | "problems";
  output: string[];
  problems: string[];
  onChangeTab: (tab: "output" | "problems") => void;
  collapsed?: boolean;
  height?: number;
  onToggleCollapse?: () => void;
  onResizeStart?: () => void;
};

export default function BottomPanel({
  activeTab,
  output,
  problems,
  onChangeTab,
  collapsed = false,
  height = 220,
  onToggleCollapse,
  onResizeStart,
}: BottomPanelProps) {
  const rows = activeTab === "output" ? output : problems;

  return (
    <div
      className="relative border-t border-border bg-card/60 transition-[height] duration-200"
      style={{ height: collapsed ? 49 : height }}
    >
      {/* Resize Handle - Desktop Only */}
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
        <div className="flex items-center gap-2">
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

        <div className="flex items-center gap-2">
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
        <div
          className="overflow-y-auto px-4 py-3"
          style={{ height: `calc(${height}px - 49px)` }}
        >
          <div className="space-y-2 font-mono text-sm">
            {rows.length > 0 ? (
              rows.map((line, index) => (
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
              ))
            ) : (
              <div className="rounded-lg border border-border bg-background px-3 py-2 text-muted-foreground">
                No {activeTab} yet.
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}