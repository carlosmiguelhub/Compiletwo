import {
  ChevronDown,
  ChevronRight,
  FileCode2,
  FileJson2,
  FilePlus2,
  FileText,
  Folder,
  FolderOpen,
  FolderPlus,
  PanelLeftClose,
  PanelLeftOpen,
  Pencil,
  Trash2,
  X,
  UserCircle2,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { ExplorerNode } from "../../pages/CompilerWorkspace";

/**
 * File explorer props from parent.
 *
 * IMPORTANT:
 * If you want the UI to show "app.html",
 * then the actual created file name must already be "app.html"
 * inside your tree data.
 */
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
  onCreateFile: (folderId?: string) => void;
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
  onCreateFile: (folderId?: string) => void;
  onRenameNode: (nodeId: string) => void;
  onDeleteNode: (nodeId: string) => void;
};

/**
 * Gets the file extension from a file name.
 * Example:
 * - app.html => html
 * - style.css => css
 * - script.js => js
 */
function getExtension(fileName: string) {
  const parts = fileName.split(".");
  if (parts.length < 2) return "";
  return parts[parts.length - 1].toLowerCase();
}

/**
 * Splits filename into:
 * - base name
 * - extension
 *
 * Example:
 * app.html => { base: "app", ext: "html" }
 */
function splitFileName(fileName: string) {
  const lastDotIndex = fileName.lastIndexOf(".");
  if (lastDotIndex <= 0) {
    return { base: fileName, ext: "" };
  }

  return {
    base: fileName.slice(0, lastDotIndex),
    ext: fileName.slice(lastDotIndex + 1),
  };
}

/**
 * Extension-aware icon and tone.
 * This makes files feel more like a real editor.
 */
function getFileMeta(fileName: string) {
  const ext = getExtension(fileName);

  switch (ext) {
    case "html":
      return {
        icon: FileCode2,
        iconClass: "text-orange-500",
        badgeClass: "text-orange-500/80",
      };

    case "css":
      return {
        icon: FileCode2,
        iconClass: "text-sky-500",
        badgeClass: "text-sky-500/80",
      };

    case "js":
      return {
        icon: FileCode2,
        iconClass: "text-yellow-500",
        badgeClass: "text-yellow-500/80",
      };

    case "ts":
      return {
        icon: FileCode2,
        iconClass: "text-blue-500",
        badgeClass: "text-blue-500/80",
      };

    case "json":
      return {
        icon: FileJson2,
        iconClass: "text-emerald-500",
        badgeClass: "text-emerald-500/80",
      };

    case "md":
    case "txt":
      return {
        icon: FileText,
        iconClass: "text-muted-foreground",
        badgeClass: "text-muted-foreground",
      };

    default:
      return {
        icon: FileCode2,
        iconClass: "text-muted-foreground",
        badgeClass: "text-muted-foreground",
      };
  }
}

/**
 * Small action buttons shown on row hover.
 */
function ExplorerActions({
  nodeId,
  isFolder = false,
  onCreateFile,
  onRenameNode,
  onDeleteNode,
}: {
  nodeId: string;
  isFolder?: boolean;
  onCreateFile?: (folderId?: string) => void;
  onRenameNode: (nodeId: string) => void;
  onDeleteNode: (nodeId: string) => void;
}) {
  return (
    <div className="ml-auto flex items-center gap-1 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
      {isFolder && onCreateFile && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCreateFile(nodeId);
          }}
          className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-muted-foreground transition hover:border-primary/20 hover:bg-primary/10 hover:text-primary"
          title="New file"
        >
          <FilePlus2 className="h-3.5 w-3.5" />
        </button>
      )}

      <button
        onClick={(e) => {
          e.stopPropagation();
          onRenameNode(nodeId);
        }}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-muted-foreground transition hover:border-primary/20 hover:bg-primary/10 hover:text-primary"
        title="Rename"
      >
        <Pencil className="h-3.5 w-3.5" />
      </button>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDeleteNode(nodeId);
        }}
        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-transparent text-muted-foreground transition hover:border-destructive/20 hover:bg-destructive/10 hover:text-destructive"
        title="Delete"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

/**
 * Recursive tree node
 */
function TreeNode({
  node,
  level = 0,
  selectedFolderId,
  activeFileId,
  collapsed,
  onSelectFolder,
  onOpenFile,
  onCreateFile,
  onRenameNode,
  onDeleteNode,
}: TreeNodeProps) {
  const [expanded, setExpanded] = useState(true);

  if (node.type === "file") {
    const active = node.id === activeFileId;
    const { base, ext } = splitFileName(node.name);
    const fileMeta = getFileMeta(node.name);
    const FileIcon = fileMeta.icon;

    return (
      <div
        className={`group relative flex w-full items-center rounded-xl transition ${
          active
            ? "bg-primary/10 ring-1 ring-primary/15"
            : "hover:bg-muted/60"
        }`}
        style={{
          paddingLeft: collapsed ? "8px" : `${level * 16 + 14}px`,
        }}
        title={collapsed ? node.name : undefined}
      >
        {!collapsed && (
          <div className="absolute left-0 top-1/2 h-5 w-[2px] -translate-y-1/2 rounded-full bg-border/70" />
        )}

        <button
          onClick={() => onOpenFile(node.id)}
          className={`flex min-w-0 flex-1 items-center rounded-xl px-3 py-2 text-left ${
            collapsed ? "justify-center" : "gap-2.5"
          }`}
        >
          <FileIcon className={`h-4 w-4 shrink-0 ${fileMeta.iconClass}`} />

          {!collapsed && (
            <div className="min-w-0 flex-1 font-mono text-[13px]">
              <span
                className={`truncate ${
                  active ? "text-primary" : "text-foreground"
                }`}
              >
                {base}
              </span>
              {ext && (
                <span className={`truncate ${fileMeta.badgeClass}`}>.{ext}</span>
              )}
            </div>
          )}
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
  const FolderIcon = expanded && !collapsed ? FolderOpen : Folder;

  return (
    <div className="space-y-1">
      <div
        className={`group flex w-full items-center rounded-xl transition ${
          selected
            ? "bg-primary/10 ring-1 ring-primary/15"
            : "hover:bg-muted/60"
        }`}
        style={{
          paddingLeft: collapsed ? "8px" : `${level * 14 + 6}px`,
        }}
        title={collapsed ? node.name : undefined}
      >
        <button
          onClick={() => {
            if (!collapsed) {
              setExpanded((prev) => !prev);
            }
            onSelectFolder(node.id);
          }}
          className={`flex min-w-0 flex-1 items-center rounded-xl px-3 py-2 text-left ${
            collapsed ? "justify-center" : "gap-2.5"
          }`}
        >
          {!collapsed &&
            (expanded ? (
              <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            ))}

          <FolderIcon
            className={`h-4 w-4 shrink-0 ${
              selected ? "text-primary" : "text-amber-500"
            }`}
          />

          {!collapsed && (
            <span
              className={`truncate font-mono text-[13px] ${
                selected ? "text-primary" : "text-foreground"
              }`}
            >
              {node.name}
            </span>
          )}
        </button>

        {!collapsed && (
          <ExplorerActions
            nodeId={node.id}
            isFolder
            onCreateFile={onCreateFile}
            onRenameNode={onRenameNode}
            onDeleteNode={onDeleteNode}
          />
        )}
      </div>

      {!collapsed && expanded && (
        <div className="space-y-1">
          {node.children.length === 0 ? (
            <div
              className="px-3 py-1.5 text-[11px] italic text-muted-foreground"
              style={{ paddingLeft: `${(level + 1) * 16 + 26}px` }}
            >
              Empty folder
            </div>
          ) : (
            node.children.map((child) => (
              <TreeNode
                key={child.id}
                node={child}
                level={level + 1}
                selectedFolderId={selectedFolderId}
                activeFileId={activeFileId}
                collapsed={collapsed}
                onSelectFolder={onSelectFolder}
                onOpenFile={onOpenFile}
                onCreateFile={onCreateFile}
                onRenameNode={onRenameNode}
                onDeleteNode={onDeleteNode}
              />
            ))
          )}
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
  const totalFolders = useMemo(
    () => tree.filter((node) => node.type === "folder").length,
    [tree]
  );

  return (
    <>
      {mobileOpen && (
        <button
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          aria-label="Close explorer overlay"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-full shrink-0 flex-col border-r border-border bg-card/95 shadow-xl transition-all duration-300 lg:static lg:z-auto lg:translate-x-0 lg:bg-card/60 lg:shadow-none ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } ${collapsed ? "w-[76px]" : "w-[320px]"}`}
      >
        {/* Header */}
        <div className="border-b border-border px-4 py-4">
          <div className="flex items-center justify-between">
            {!collapsed && (
              <div className="min-w-0">
                <h2 className="truncate font-mono text-base font-semibold text-foreground">
                  Judge-Compilo
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Workspace Explorer
                </p>
              </div>
            )}

            <div
              className={`flex items-center gap-2 ${
                collapsed ? "w-full justify-center" : ""
              }`}
            >
              <button
                onClick={onToggleCollapse}
                className="hidden h-10 w-10 items-center justify-center rounded-xl border border-border bg-background transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary lg:inline-flex"
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
                  className="inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-border bg-background transition hover:border-primary/30"
                  title="Profile"
                >
                  {userPhotoURL ? (
                    <img
                      src={userPhotoURL}
                      alt="Profile"
                      referrerPolicy="no-referrer"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <UserCircle2 className="h-5 w-5 text-muted-foreground" />
                  )}
                </button>
              )}

              <button
                onClick={onCloseMobile}
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background transition hover:border-primary/30 hover:text-primary lg:hidden"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {!collapsed && (
          <div className="border-b border-border px-4 py-4">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0 rounded-2xl border border-primary/20 bg-primary/5 px-4 py-2">
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-primary">
                  Project Folders
                </p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  {totalFolders} folder{totalFolders !== 1 ? "s" : ""}
                </p>
              </div>

              <button
                onClick={onCreateFolder}
                className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-background transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                title="Create folder"
              >
                <FolderPlus className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

        {collapsed ? (
          <div className="flex flex-1 flex-col items-center gap-2 overflow-y-auto px-2 py-3">
            <button
              onClick={onProfileClick}
              className="inline-flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-border bg-background transition hover:border-primary/30"
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
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
              title="Create folder"
            >
              <FolderPlus className="h-4 w-4" />
            </button>

            <div className="mt-3 w-full space-y-1">
              {tree.map((node) => (
                <TreeNode
                  key={node.id}
                  node={node}
                  selectedFolderId={selectedFolderId}
                  activeFileId={activeFileId}
                  collapsed={collapsed}
                  onSelectFolder={onSelectFolder}
                  onOpenFile={onOpenFile}
                  onCreateFile={onCreateFile}
                  onRenameNode={onRenameNode}
                  onDeleteNode={onDeleteNode}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-3 py-3">
            {tree.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed border-border px-6 text-center">
                <FolderOpen className="h-8 w-8 text-muted-foreground" />
                <h3 className="mt-3 font-medium text-foreground">
                  No folders yet
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Create your first project folder to get started.
                </p>
                <button
                  onClick={onCreateFolder}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm transition hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                >
                  <FolderPlus className="h-4 w-4" />
                  Create Folder
                </button>
              </div>
            ) : (
              <div className="space-y-1.5">
                {tree.map((node) => (
                  <TreeNode
                    key={node.id}
                    node={node}
                    selectedFolderId={selectedFolderId}
                    activeFileId={activeFileId}
                    collapsed={collapsed}
                    onSelectFolder={onSelectFolder}
                    onOpenFile={onOpenFile}
                    onCreateFile={onCreateFile}
                    onRenameNode={onRenameNode}
                    onDeleteNode={onDeleteNode}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </aside>
    </>
  );
}