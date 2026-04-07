import { useEffect, useMemo, useState } from "react";
import Topbar from "../components/compiler/Topbar";
import FileExplorer from "../components/compiler/FileExplorer";
import EditorTabs from "../components/compiler/EditorTabs";
import EditorPanel from "../components/compiler/EditorPanel";
import BottomPanel from "../components/compiler/BottomPanel";

export type CompilerLanguage =
  | "javascript"
  | "typescript"
  | "python"
  | "java"
  | "c"
  | "cpp"
  | "csharp"
  | "sql"
  | "html";

export type ExplorerFile = {
  id: string;
  name: string;
  type: "file";
  language: CompilerLanguage;
  content: string;
};

export type ExplorerFolder = {
  id: string;
  name: string;
  type: "folder";
  children: ExplorerNode[];
};

export type ExplorerNode = ExplorerFile | ExplorerFolder;

type DialogMode =
  | "create-folder"
  | "create-file"
  | "rename"
  | "delete"
  | null;

const languageOptions: CompilerLanguage[] = [
  "javascript",
  "typescript",
  "python",
  "java",
  "c",
  "cpp",
  "csharp",
  "sql",
  "html",
];

const starterContent: Record<CompilerLanguage, string> = {
  javascript: `function greet() {
  console.log("Hello from Judge-Compilo");
}

greet();
`,
  typescript: `function greet(name: string): void {
  console.log(\`Hello, \${name}\`);
}

greet("CodeForge");
`,
  python: `def greet():
    print("Hello from Judge-Compilo")

greet()
`,
  java: `import java.util.*;

public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from Judge-Compilo");
    }
}
`,
  c: `#include <stdio.h>

int main() {
    printf("Hello from Judge-Compilo\\n");
    return 0;
}
`,
  cpp: `#include <iostream>
using namespace std;

int main() {
    cout << "Hello from Judge-Compilo" << endl;
    return 0;
}
`,
  csharp: `using System;

class Program
{
    static void Main()
    {
        Console.WriteLine("Hello from Judge-Compilo");
    }
}
`,
  sql: `SELECT 'Hello from Judge-Compilo' AS message;
`,
  html: `<!DOCTYPE html>
<html>
  <head>
    <title>Judge-Compilo</title>
  </head>
  <body>
    <h1>Hello from Judge-Compilo</h1>
  </body>
</html>
`,
};

function createFile(
  id: string,
  name: string,
  language: CompilerLanguage
): ExplorerFile {
  return {
    id,
    name,
    type: "file",
    language,
    content: starterContent[language],
  };
}

function findFileById(nodes: ExplorerNode[], fileId: string): ExplorerFile | null {
  for (const node of nodes) {
    if (node.type === "file" && node.id === fileId) return node;
    if (node.type === "folder") {
      const found = findFileById(node.children, fileId);
      if (found) return found;
    }
  }
  return null;
}

function findNodeById(nodes: ExplorerNode[], nodeId: string): ExplorerNode | null {
  for (const node of nodes) {
    if (node.id === nodeId) return node;
    if (node.type === "folder") {
      const found = findNodeById(node.children, nodeId);
      if (found) return found;
    }
  }
  return null;
}

function folderExists(nodes: ExplorerNode[], folderId: string): boolean {
  return nodes.some((node) => {
    if (node.type === "folder" && node.id === folderId) return true;
    return node.type === "folder" ? folderExists(node.children, folderId) : false;
  });
}

function updateFileContent(
  nodes: ExplorerNode[],
  fileId: string,
  nextContent: string
): ExplorerNode[] {
  return nodes.map((node) => {
    if (node.type === "file" && node.id === fileId) {
      return { ...node, content: nextContent };
    }

    if (node.type === "folder") {
      return {
        ...node,
        children: updateFileContent(node.children, fileId, nextContent),
      };
    }

    return node;
  });
}

function updateFileLanguage(
  nodes: ExplorerNode[],
  fileId: string,
  nextLanguage: CompilerLanguage
): ExplorerNode[] {
  return nodes.map((node) => {
    if (node.type === "file" && node.id === fileId) {
      return { ...node, language: nextLanguage };
    }

    if (node.type === "folder") {
      return {
        ...node,
        children: updateFileLanguage(node.children, fileId, nextLanguage),
      };
    }

    return node;
  });
}

function addNodeToFolder(
  nodes: ExplorerNode[],
  folderId: string,
  newNode: ExplorerNode
): ExplorerNode[] {
  return nodes.map((node) => {
    if (node.type === "folder" && node.id === folderId) {
      return { ...node, children: [...node.children, newNode] };
    }

    if (node.type === "folder") {
      return {
        ...node,
        children: addNodeToFolder(node.children, folderId, newNode),
      };
    }

    return node;
  });
}

function renameNodeById(
  nodes: ExplorerNode[],
  nodeId: string,
  nextName: string
): ExplorerNode[] {
  return nodes.map((node) => {
    if (node.id === nodeId) {
      return { ...node, name: nextName };
    }

    if (node.type === "folder") {
      return {
        ...node,
        children: renameNodeById(node.children, nodeId, nextName),
      };
    }

    return node;
  });
}

function deleteNodeById(nodes: ExplorerNode[], nodeId: string): ExplorerNode[] {
  return nodes
    .filter((node) => node.id !== nodeId)
    .map((node) => {
      if (node.type === "folder") {
        return {
          ...node,
          children: deleteNodeById(node.children, nodeId),
        };
      }
      return node;
    });
}

function collectAllFiles(nodes: ExplorerNode[]): ExplorerFile[] {
  const files: ExplorerFile[] = [];

  for (const node of nodes) {
    if (node.type === "file") {
      files.push(node);
    } else {
      files.push(...collectAllFiles(node.children));
    }
  }

  return files;
}

function collectFileIdsFromNode(node: ExplorerNode): string[] {
  if (node.type === "file") return [node.id];
  return node.children.flatMap((child) => collectFileIdsFromNode(child));
}

function getFirstFolderId(nodes: ExplorerNode[]): string {
  for (const node of nodes) {
    if (node.type === "folder") return node.id;
  }
  return "";
}

function getFirstFile(nodes: ExplorerNode[]): ExplorerFile | null {
  for (const node of nodes) {
    if (node.type === "file") return node;
    if (node.type === "folder") {
      const found = getFirstFile(node.children);
      if (found) return found;
    }
  }
  return null;
}

function formatLanguageLabel(language: CompilerLanguage) {
  const map: Record<CompilerLanguage, string> = {
    javascript: "JavaScript",
    typescript: "TypeScript",
    python: "Python",
    java: "Java",
    c: "C",
    cpp: "C++",
    csharp: "C#",
    sql: "SQL",
    html: "HTML",
  };

  return map[language];
}

export default function CompilerWorkspace() {
    const [terminalOpen, setTerminalOpen] = useState(false);
  const [language, setLanguage] = useState<CompilerLanguage>("java");
  const [projectTree, setProjectTree] = useState<ExplorerNode[]>([
    {
      id: "folder-1",
      name: "my-project",
      type: "folder",
      children: [
        createFile("file-1", "main.js", "javascript"),
        createFile("file-2", "utils.py", "python"),
        createFile("file-3", "app.java", "java"),
        createFile("file-4", "query.sql", "sql"),
      ],
    },
    {
      id: "folder-2",
      name: "snippets",
      type: "folder",
      children: [createFile("file-5", "index.html", "html")],
    },
  ]);

  const [openFileIds, setOpenFileIds] = useState<string[]>(["file-3"]);
  const [activeFileId, setActiveFileId] = useState<string>("file-3");
  const [selectedFolderId, setSelectedFolderId] = useState<string>("folder-1");
  const [bottomTab, setBottomTab] = useState<"output" | "problems">("output");
  const [output, setOutput] = useState<string[]>([
    "[4:10:19 AM] Workspace ready.",
    "Program output will appear here when Judge0 is connected.",
  ]);
  const [problems] = useState<string[]>(["No problems detected."]);
  const [unsavedFileIds, setUnsavedFileIds] = useState<string[]>([]);
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [targetNodeId, setTargetNodeId] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [newFileLanguage, setNewFileLanguage] =
    useState<CompilerLanguage>("java");
  const [mobileExplorerOpen, setMobileExplorerOpen] = useState(false);

  const activeFile = useMemo(
    () => findFileById(projectTree, activeFileId),
    [projectTree, activeFileId]
  );

  const allFiles = useMemo(() => collectAllFiles(projectTree), [projectTree]);
  const targetNode = useMemo(
    () => (targetNodeId ? findNodeById(projectTree, targetNodeId) : null),
    [projectTree, targetNodeId]
  );

  useEffect(() => {
    if (!folderExists(projectTree, selectedFolderId)) {
      setSelectedFolderId(getFirstFolderId(projectTree));
    }
  }, [projectTree, selectedFolderId]);

  const appendLog = (message: string) => {
    setOutput((prev) => [...prev, message]);
  };

  const openCreateFolderDialog = () => {
    setDialogMode("create-folder");
    setTargetNodeId(null);
    setNameInput("");
  };

  const openCreateFileDialog = () => {
    setDialogMode("create-file");
    setTargetNodeId(null);
    setNameInput("");
    setNewFileLanguage(language);
  };

  const openRenameDialog = (nodeId: string) => {
    const node = findNodeById(projectTree, nodeId);
    if (!node) return;

    setDialogMode("rename");
    setTargetNodeId(nodeId);
    setNameInput(node.name);
  };

  const openDeleteDialog = (nodeId: string) => {
    const node = findNodeById(projectTree, nodeId);
    if (!node) return;

    setDialogMode("delete");
    setTargetNodeId(nodeId);
    setNameInput(node.name);
  };

  const closeDialog = () => {
    setDialogMode(null);
    setTargetNodeId(null);
    setNameInput("");
  };

  const handleOpenFile = (fileId: string) => {
    const file = findFileById(projectTree, fileId);
    if (!file) return;

    if (!openFileIds.includes(fileId)) {
      setOpenFileIds((prev) => [...prev, fileId]);
    }

    setActiveFileId(fileId);
    setLanguage(file.language);
    setMobileExplorerOpen(false);
  };

  const handleCloseTab = (fileId: string) => {
    const nextOpen = openFileIds.filter((id) => id !== fileId);
    setOpenFileIds(nextOpen);

    if (fileId === activeFileId) {
      if (nextOpen.length > 0) {
        const nextActive = nextOpen[nextOpen.length - 1];
        setActiveFileId(nextActive);

        const nextFile = findFileById(projectTree, nextActive);
        if (nextFile) setLanguage(nextFile.language);
      } else {
        setActiveFileId("");
      }
    }
  };

  const handleContentChange = (value: string) => {
    if (!activeFile) return;

    setProjectTree((prev) => updateFileContent(prev, activeFile.id, value));

    setUnsavedFileIds((prev) =>
      prev.includes(activeFile.id) ? prev : [...prev, activeFile.id]
    );
  };

  const handleLanguageChange = (nextLanguage: CompilerLanguage) => {
    setLanguage(nextLanguage);

    if (!activeFile) return;

    setProjectTree((prev) =>
      updateFileLanguage(prev, activeFile.id, nextLanguage)
    );
    setUnsavedFileIds((prev) =>
      prev.includes(activeFile.id) ? prev : [...prev, activeFile.id]
    );
    appendLog(
      `[${new Date().toLocaleTimeString()}] ${activeFile.name} language set to ${formatLanguageLabel(
        nextLanguage
      )}.`
    );
  };

  const handleSave = () => {
    if (!activeFile) return;

    setUnsavedFileIds((prev) => prev.filter((id) => id !== activeFile.id));
    appendLog(
      `[${new Date().toLocaleTimeString()}] Saved ${activeFile.name} successfully.`
    );
  };

  const handleDownloadFile = () => {
    if (!activeFile) return;

    const blob = new Blob([activeFile.content], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);

    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = activeFile.name;
    anchor.click();

    URL.revokeObjectURL(url);

    appendLog(`Downloaded ${activeFile.name}.`);
  };

  const handleRun = () => {
    if (!activeFile) return;

    setBottomTab("output");
    setOutput((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] Running ${activeFile.name} (${language})...`,
      "Judge0 CE integration will be connected in Phase 2.",
    ]);
  };

  const handleDialogConfirm = () => {
    if (dialogMode === "create-folder") {
      const trimmed = nameInput.trim();
      if (!trimmed) return;

      const newFolder: ExplorerFolder = {
        id: `folder-${Date.now()}`,
        name: trimmed,
        type: "folder",
        children: [],
      };

      setProjectTree((prev) => [...prev, newFolder]);
      setSelectedFolderId(newFolder.id);
      appendLog(`Created folder "${newFolder.name}".`);
      closeDialog();
      return;
    }

    if (dialogMode === "create-file") {
      const trimmed = nameInput.trim();
      if (!trimmed) return;

      const folderId = selectedFolderId || getFirstFolderId(projectTree);
      if (!folderId) return;

      const newFile = createFile(
        `file-${Date.now()}`,
        trimmed,
        newFileLanguage
      );

      setProjectTree((prev) => addNodeToFolder(prev, folderId, newFile));
      setOpenFileIds((prev) => [...prev, newFile.id]);
      setActiveFileId(newFile.id);
      setLanguage(newFile.language);
      setUnsavedFileIds((prev) =>
        prev.includes(newFile.id) ? prev : [...prev, newFile.id]
      );
      appendLog(`Created file "${newFile.name}".`);
      closeDialog();
      return;
    }

    if (dialogMode === "rename" && targetNode) {
      const trimmed = nameInput.trim();
      if (!trimmed) return;

      setProjectTree((prev) => renameNodeById(prev, targetNode.id, trimmed));
      appendLog(`Renamed "${targetNode.name}" to "${trimmed}".`);
      closeDialog();
      return;
    }

    if (dialogMode === "delete" && targetNode) {
      const deletedFileIds = collectFileIdsFromNode(targetNode);
      const nextTree = deleteNodeById(projectTree, targetNode.id);
      const nextOpenIds = openFileIds.filter((id) => !deletedFileIds.includes(id));
      const activeDeleted = deletedFileIds.includes(activeFileId);

      setProjectTree(nextTree);
      setOpenFileIds(nextOpenIds);
      setUnsavedFileIds((prev) =>
        prev.filter((id) => !deletedFileIds.includes(id))
      );

      if (targetNode.type === "folder" && targetNode.id === selectedFolderId) {
        setSelectedFolderId(getFirstFolderId(nextTree));
      }

      if (activeDeleted) {
        if (nextOpenIds.length > 0) {
          const nextActiveId = nextOpenIds[nextOpenIds.length - 1];
          setActiveFileId(nextActiveId);
          const nextActiveFile = findFileById(nextTree, nextActiveId);
          if (nextActiveFile) setLanguage(nextActiveFile.language);
        } else {
          const fallbackFile = getFirstFile(nextTree);
          if (fallbackFile) {
            setActiveFileId(fallbackFile.id);
            setOpenFileIds([fallbackFile.id]);
            setLanguage(fallbackFile.language);
          } else {
            setActiveFileId("");
          }
        }
      }

      appendLog(`Deleted "${targetNode.name}".`);
      closeDialog();
    }
  };

  const dialogTitle =
    dialogMode === "create-folder"
      ? "Create Folder"
      : dialogMode === "create-file"
      ? "Create File"
      : dialogMode === "rename"
      ? `Rename ${targetNode?.type === "folder" ? "Folder" : "File"}`
      : "Delete Item";

  const dialogDescription =
    dialogMode === "create-folder"
      ? "Create a new project folder in your local workspace."
      : dialogMode === "create-file"
      ? "Create a new file inside the selected folder."
      : dialogMode === "rename"
      ? "Update the name of the selected item."
      : `This will remove "${targetNode?.name ?? ""}" from the local workspace.`;

  return (
    <>
      <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
        <FileExplorer
          tree={projectTree}
          selectedFolderId={selectedFolderId}
          activeFileId={activeFileId}
          mobileOpen={mobileExplorerOpen}
          onCloseMobile={() => setMobileExplorerOpen(false)}
          onSelectFolder={setSelectedFolderId}
          onOpenFile={handleOpenFile}
          onCreateFolder={openCreateFolderDialog}
          onCreateFile={openCreateFileDialog}
          onRenameNode={openRenameDialog}
          onDeleteNode={openDeleteDialog}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar
            language={language}
            activeFileName={activeFile?.name ?? "No file selected"}
            onLanguageChange={handleLanguageChange}
            onSave={handleSave}
            onRun={handleRun}
            onDownload={handleDownloadFile}
            onToggleExplorer={() => setMobileExplorerOpen(true)}
          />

          <EditorTabs
            files={allFiles.filter((file) => openFileIds.includes(file.id))}
            activeFileId={activeFileId}
            unsavedFileIds={unsavedFileIds}
            onSelectTab={handleOpenFile}
            onCloseTab={handleCloseTab}
          />

          {activeFile ? (
            <EditorPanel
              fileName={activeFile.name}
              language={activeFile.language}
              value={activeFile.content}
              onChange={handleContentChange}
            />
          ) : (
            <div className="flex min-h-0 flex-1 items-center justify-center bg-background px-6">
              <div className="max-w-md rounded-2xl border border-border bg-card/50 p-8 text-center shadow-xl shadow-primary/5">
                <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
                  Workspace
                </p>
                <h3 className="mt-3 font-mono text-xl font-semibold text-foreground">
                  No file selected
                </h3>
                <p className="mt-3 text-sm text-muted-foreground">
                  Open a file from the explorer or create a new one to start
                  coding inside your Judge-Compilo workspace.
                </p>
                <div className="mt-6 flex items-center justify-center gap-3">
                  <button
                    onClick={openCreateFolderDialog}
                    className="rounded-xl border border-border bg-background px-4 py-2 font-mono text-sm transition hover:border-primary hover:text-primary"
                  >
                    New Folder
                  </button>
                  <button
                    onClick={openCreateFileDialog}
                    className="rounded-xl bg-primary px-4 py-2 font-mono text-sm font-semibold text-primary-foreground transition hover:opacity-90"
                  >
                    New File
                  </button>
                </div>
              </div>
            </div>
          )}
<div className="lg:hidden border-t border-border bg-card/80 px-3 py-2">
  <button
    onClick={() => setTerminalOpen((prev) => !prev)}
    className="w-full rounded-xl border border-border bg-background px-4 py-2 font-mono text-sm transition hover:border-primary hover:text-primary"
  >
    {terminalOpen ? "Hide Terminal" : "Show Terminal"}
  </button>
</div>

<div className={`${terminalOpen ? "block" : "hidden"} lg:block`}>
  <BottomPanel
    activeTab={bottomTab}
    output={output}
    problems={problems}
    onChangeTab={setBottomTab}
  />
</div>
        </div>
      </div>

      {dialogMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-2xl shadow-primary/10">
            <p className="font-mono text-xs uppercase tracking-[0.28em] text-primary">
              Judge-Compilo
            </p>
            <h3 className="mt-2 font-mono text-xl font-semibold text-foreground">
              {dialogTitle}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {dialogDescription}
            </p>

            {dialogMode !== "delete" && (
              <div className="mt-5 space-y-4">
                <div className="space-y-2">
                  <label className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                    Name
                  </label>
                  <input
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder={
                      dialogMode === "create-file" ? "main.cpp" : "my-project"
                    }
                    className="h-11 w-full rounded-xl border border-border bg-background px-3 font-mono text-sm outline-none transition focus:border-primary"
                  />
                </div>

                {dialogMode === "create-file" && (
                  <div className="space-y-2">
                    <label className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      Language
                    </label>
                    <select
                      value={newFileLanguage}
                      onChange={(e) =>
                        setNewFileLanguage(e.target.value as CompilerLanguage)
                      }
                      className="h-11 w-full rounded-xl border border-border bg-background px-3 font-mono text-sm outline-none transition focus:border-primary"
                    >
                      {languageOptions.map((item) => (
                        <option key={item} value={item}>
                          {formatLanguageLabel(item)}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )}

            {dialogMode === "delete" && (
              <div className="mt-5 rounded-xl border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-muted-foreground">
                This action only affects local Phase 1 state for now. Firebase
                persistence comes in Phase 2.
              </div>
            )}

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                onClick={closeDialog}
                className="rounded-xl border border-border bg-background px-4 py-2 font-mono text-sm transition hover:border-primary hover:text-primary"
              >
                Cancel
              </button>
              <button
                onClick={handleDialogConfirm}
                className={`rounded-xl px-4 py-2 font-mono text-sm font-semibold transition hover:opacity-90 ${
                  dialogMode === "delete"
                    ? "bg-destructive text-destructive-foreground"
                    : "bg-primary text-primary-foreground"
                }`}
              >
                {dialogMode === "delete"
                  ? "Delete"
                  : dialogMode === "rename"
                  ? "Save Changes"
                  : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}