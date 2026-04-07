import {
  ChevronDown,
  ChevronRight,
  FileCode2,
  Folder,
  FolderPlus,
  Pencil,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useState } from "react";
import type { ExplorerNode } from "../../pages/CompilerWorkspace";

type FileExplorerProps = {
  tree: ExplorerNode[];
  selectedFolderId: string;
  activeFileId: string;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onSelectFolder: (folderId: string) => void;
  onOpenFile: (fileId: string) => void;
  onCreateFolder: () => void;
  onCreateFile: () => void;
  onRenameNode: (nodeId: string) => void;
  onDeleteNode: (nodeId: string) => void;
};

type TreeNodeProps = {
  node: ExplorerNode;
  level?: number;
  selectedFolderId: string;
  activeFileId: string;
  onSelectFolder: (folderId: string) => void;
  onOpenFile: (fileId: string) => void;
  onRenameNode: (nodeId: string) => void;
  onDeleteNode: (nodeId: string) => void;
};

function ExplorerActions({
  nodeId,
  onRenameNode,
  onDeleteNode,
}: {
  nodeId: string;
  onRenameNode: (nodeId: string) => void;
  onDeleteNode: (nodeId: string) => void;
}) {
  return (
    <div className="ml-auto hidden items-center gap-1 group-hover:flex">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRenameNode(nodeId);
        }}
        className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-transparent text-muted-foreground transition hover:border-primary/30 hover:bg-primary/10 hover:text-primary"
        title="Rename"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDeleteNode(nodeId);
        }}
        className="inline-flex h-7 w-7 items-center justify-center rounded-md border border-transparent text-muted-foreground transition hover:border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
        title="Delete"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function TreeNode({
  node,
  level = 0,
  selectedFolderId,
  activeFileId,
  onSelectFolder,
  onOpenFile,
  onRenameNode,
  onDeleteNode,
}: TreeNodeProps) {
  const [expanded, setExpanded] = useState(true);

  if (node.type === "file") {
    const active = node.id === activeFileId;

    return (
      <div
        className={`group flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left font-mono text-sm transition ${
          active
            ? "bg-primary/15 text-primary"
            : "text-foreground hover:bg-muted/60"
        }`}
        style={{ paddingLeft: `${level * 14 + 8}px` }}
      >
        <button
          onClick={() => onOpenFile(node.id)}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <FileCode2 className="h-4 w-4 shrink-0" />
          <span className="truncate">{node.name}</span>
        </button>

        <ExplorerActions
          nodeId={node.id}
          onRenameNode={onRenameNode}
          onDeleteNode={onDeleteNode}
        />
      </div>
    );
  }

  const selected = node.id === selectedFolderId;

  return (
    <div className="space-y-1">
      <div
        className={`group flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left font-mono text-sm transition ${
          selected
            ? "bg-primary/10 text-primary"
            : "text-foreground hover:bg-muted/60"
        }`}
        style={{ paddingLeft: `${level * 14 + 8}px` }}
      >
        <button
          onClick={() => {
            setExpanded((prev) => !prev);
            onSelectFolder(node.id);
          }}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          {expanded ? (
            <ChevronDown className="h-4 w-4 shrink-0" />
          ) : (
            <ChevronRight className="h-4 w-4 shrink-0" />
          )}
          <Folder className="h-4 w-4 shrink-0" />
          <span className="truncate">{node.name}</span>
        </button>

        <ExplorerActions
          nodeId={node.id}
          onRenameNode={onRenameNode}
          onDeleteNode={onDeleteNode}
        />
      </div>

      {expanded && (
        <div className="space-y-1">
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              selectedFolderId={selectedFolderId}
              activeFileId={activeFileId}
              onSelectFolder={onSelectFolder}
              onOpenFile={onOpenFile}
              onRenameNode={onRenameNode}
              onDeleteNode={onDeleteNode}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FileExplorer({
  tree,
  selectedFolderId,
  activeFileId,
  mobileOpen,
  onCloseMobile,
  onSelectFolder,
  onOpenFile,
  onCreateFolder,
  onCreateFile,
  onRenameNode,
  onDeleteNode,
}: FileExplorerProps) {
  return (
    <>
      {mobileOpen && (
        <button
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          aria-label="Close explorer overlay"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-full w-[300px] shrink-0 flex-col border-r border-border bg-card/95 transition-transform duration-300 lg:static lg:z-auto lg:translate-x-0 lg:bg-card/40 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-4 lg:block">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted-foreground">
              Explorer
            </p>
            <h2 className="mt-1 font-mono text-sm font-semibold text-foreground">
              Projects
            </h2>
          </div>

          <button
            onClick={onCloseMobile}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background transition hover:border-primary hover:text-primary lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="border-b border-border px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="rounded-xl border border-primary/20 bg-primary/5 px-3 py-2">
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-primary">
                Local Phase 1
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Create, rename, delete, and edit are local only for now.
              </p>
            </div>

            <div className="ml-3 flex items-center gap-2">
              <button
                onClick={onCreateFolder}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background transition hover:border-primary hover:text-primary"
                title="Create folder"
              >
                <FolderPlus className="h-4 w-4" />
              </button>

              <button
                onClick={onCreateFile}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background transition hover:border-primary hover:text-primary"
                title="Create file"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 space-y-1 overflow-y-auto px-3 py-3">
          {tree.map((node) => (
            <TreeNode
              key={node.id}
              node={node}
              selectedFolderId={selectedFolderId}
              activeFileId={activeFileId}
              onSelectFolder={onSelectFolder}
              onOpenFile={onOpenFile}
              onRenameNode={onRenameNode}
              onDeleteNode={onDeleteNode}
            />
          ))}
        </div>
      </aside>
    </>
  );
}