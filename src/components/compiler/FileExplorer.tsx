import {
  ChevronDown,
  ChevronRight,
  FileCode2,
  Folder,
  FolderPlus,
  PanelLeftClose,
  PanelLeftOpen,
  Pencil,
  Plus,
  Trash2,
  X,
  UserCircle2,
} from "lucide-react";
import { useState } from "react";
import type { ExplorerNode } from "../../pages/CompilerWorkspace";

type FileExplorerProps = {
  tree: ExplorerNode[];
  selectedFolderId: string;
  activeFileId: string;
  mobileOpen: boolean;
  collapsed: boolean;
  onCloseMobile: () => void;
  onToggleCollapse: () => void;
  onSelectFolder: (folderId: string) => void;
  onOpenFile: (fileId: string) => void;
  onCreateFolder: () => void;
  onCreateFile: () => void;
  onRenameNode: (nodeId: string) => void;
  onDeleteNode: (nodeId: string) => void;
  onProfileClick: () => void;
  userPhotoURL?: string | null;
};

type TreeNodeProps = {
  node: ExplorerNode;
  level?: number;
  selectedFolderId: string;
  activeFileId: string;
  collapsed: boolean;
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
  collapsed,
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
        style={{ paddingLeft: collapsed ? "8px" : `${level * 14 + 8}px` }}
        title={collapsed ? node.name : undefined}
      >
        <button
          onClick={() => onOpenFile(node.id)}
          className={`flex min-w-0 flex-1 items-center ${
            collapsed ? "justify-center" : "gap-2 text-left"
          }`}
        >
          <FileCode2 className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="truncate">{node.name}</span>}
        </button>

        {!collapsed && (
          <ExplorerActions
            nodeId={node.id}
            onRenameNode={onRenameNode}
            onDeleteNode={onDeleteNode}
          />
        )}
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
        style={{ paddingLeft: collapsed ? "8px" : `${level * 14 + 8}px` }}
        title={collapsed ? node.name : undefined}
      >
        <button
          onClick={() => {
            if (!collapsed) {
              setExpanded((prev) => !prev);
            }
            onSelectFolder(node.id);
          }}
          className={`flex min-w-0 flex-1 items-center ${
            collapsed ? "justify-center" : "gap-2 text-left"
          }`}
        >
          {!collapsed &&
            (expanded ? (
              <ChevronDown className="h-4 w-4 shrink-0" />
            ) : (
              <ChevronRight className="h-4 w-4 shrink-0" />
            ))}
          <Folder className="h-4 w-4 shrink-0" />
          {!collapsed && <span className="truncate">{node.name}</span>}
        </button>

        {!collapsed && (
          <ExplorerActions
            nodeId={node.id}
            onRenameNode={onRenameNode}
            onDeleteNode={onDeleteNode}
          />
        )}
      </div>

      {!collapsed && expanded && (
        <div className="space-y-1">
          {node.children.map((child) => (
            <TreeNode
              key={child.id}
              node={child}
              level={level + 1}
              selectedFolderId={selectedFolderId}
              activeFileId={activeFileId}
              collapsed={collapsed}
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
  collapsed,
  onCloseMobile,
  onToggleCollapse,
  onSelectFolder,
  onOpenFile,
  onCreateFolder,
  onCreateFile,
  onRenameNode,
  onDeleteNode,
  onProfileClick,
  userPhotoURL,
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
        className={`fixed inset-y-0 left-0 z-50 flex h-full shrink-0 flex-col border-r border-border bg-card/95 transition-all duration-300 lg:static lg:z-auto lg:translate-x-0 lg:bg-card/40 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } ${collapsed ? "w-[72px]" : "w-[300px]"}`}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-4">
          <div className={`${collapsed ? "hidden" : "block"}`}>
            <h2 className="mt-1 font-mono text-sm font-semibold text-foreground">
              Judge-Compilo
            </h2>
          </div>

          <div className={`flex items-center gap-2 ${collapsed ? "w-full justify-center" : ""}`}>
            <button
              onClick={onToggleCollapse}
              className="hidden lg:inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background transition hover:border-primary hover:text-primary"
              title={collapsed ? "Expand explorer" : "Collapse explorer"}
            >
              {collapsed ? (
                <PanelLeftOpen className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </button>

            {!collapsed && (
              <button
                onClick={onProfileClick}
                className="inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-border bg-background transition hover:border-primary"
                title="Profile"
              >
                {userPhotoURL ? (
                  <img
                    src={userPhotoURL}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <UserCircle2 className="h-5 w-5 text-muted-foreground" />
                )}
              </button>
            )}

            <button
              onClick={onCloseMobile}
              className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-background transition hover:border-primary hover:text-primary lg:hidden"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {!collapsed && (
          <div className="border-b border-border px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="rounded-xl border border-primary/20 bg-primary/5 px-3 py-2">
                <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-primary">
                  Project Folders
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
        )}

        {collapsed ? (
          <div className="flex flex-1 flex-col items-center gap-2 overflow-y-auto px-2 py-3">
            <button
              onClick={onProfileClick}
              className="inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-border bg-background transition hover:border-primary"
              title="Profile"
            >
              {userPhotoURL ? (
                <img
                  src={userPhotoURL}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              ) : (
                <UserCircle2 className="h-5 w-5 text-muted-foreground" />
              )}
            </button>

            <button
              onClick={onCreateFolder}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background transition hover:border-primary hover:text-primary"
              title="Create folder"
            >
              <FolderPlus className="h-4 w-4" />
            </button>

            <button
              onClick={onCreateFile}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-background transition hover:border-primary hover:text-primary"
              title="Create file"
            >
              <Plus className="h-4 w-4" />
            </button>

            <div className="mt-2 w-full space-y-1">
              {tree.map((node) => (
                <TreeNode
                  key={node.id}
                  node={node}
                  selectedFolderId={selectedFolderId}
                  activeFileId={activeFileId}
                  collapsed={collapsed}
                  onSelectFolder={onSelectFolder}
                  onOpenFile={onOpenFile}
                  onRenameNode={onRenameNode}
                  onDeleteNode={onDeleteNode}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 space-y-1 overflow-y-auto px-3 py-3">
            {tree.map((node) => (
              <TreeNode
                key={node.id}
                node={node}
                selectedFolderId={selectedFolderId}
                activeFileId={activeFileId}
                collapsed={collapsed}
                onSelectFolder={onSelectFolder}
                onOpenFile={onOpenFile}
                onRenameNode={onRenameNode}
                onDeleteNode={onDeleteNode}
              />
            ))}
          </div>
        )}
      </aside>
    </>
  );
}