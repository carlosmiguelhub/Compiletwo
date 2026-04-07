import { X } from "lucide-react";
import type { ExplorerFile } from "../../pages/CompilerWorkspace";

type EditorTabsProps = {
  files: ExplorerFile[];
  activeFileId: string;
  unsavedFileIds: string[];
  onSelectTab: (fileId: string) => void;
  onCloseTab: (fileId: string) => void;
};

export default function EditorTabs({
  files,
  activeFileId,
  unsavedFileIds,
  onSelectTab,
  onCloseTab,
}: EditorTabsProps) {
  return (
    <div className="border-b border-border bg-background/90">
      <div className="flex overflow-x-auto">
        {files.map((file) => {
          const active = file.id === activeFileId;
          const dirty = unsavedFileIds.includes(file.id);

          return (
            <div
              key={file.id}
              className={`group flex shrink-0 items-center gap-2 border-r border-border px-3 py-2 font-mono text-xs sm:px-4 sm:py-3 sm:text-sm transition ${
                active
                  ? "bg-card text-foreground"
                  : "bg-background text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              }`}
            >
              <button
                onClick={() => onSelectTab(file.id)}
                className="flex items-center gap-2"
              >
                <span className="truncate">{file.name}</span>
                {dirty && <span className="h-2 w-2 rounded-full bg-primary" />}
              </button>

              <button
                onClick={() => onCloseTab(file.id)}
                className="rounded p-1 opacity-60 transition hover:bg-muted hover:opacity-100"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}