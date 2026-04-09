import { useEffect, useMemo, useState } from "react";
import Topbar from "../components/compiler/Topbar";
import FileExplorer from "../components/compiler/FileExplorer";
import EditorTabs from "../components/compiler/EditorTabs";
import EditorPanel from "../components/compiler/EditorPanel";
import BottomPanel from "../components/compiler/BottomPanel";
import { useNavigate } from "react-router-dom";
import { onAuthStateChanged, type User as FirebaseUser } from "firebase/auth";
import { auth } from "../firebase/config";
import { runCode } from "../lib/judge0Service";
import { loadWorkspace, saveWorkspace } from "../lib/workspaceService";

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

/**
 * Default starter code per language.
 * This is used when creating a new file.
 */
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

/**
 * Creates a file node with starter content.
 */
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

/**
 * Creates the default project tree for new users
 * or users with no saved workspace yet.
 */
function createDefaultProjectTree(): ExplorerNode[] {
  return [
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
  ];
}

/**
 * Returns a complete default workspace state.
 * Used the first time a user's cloud workspace is created.
 */
function createDefaultWorkspace() {
  return {
    tree: createDefaultProjectTree(),
    openFileIds: ["file-3"],
    activeFileId: "file-3",
    selectedFolderId: "folder-1",
  };
}

/**
 * Searches the whole tree and returns a file by id.
 */
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

/**
 * Searches the whole tree and returns any node by id.
 */
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

/**
 * Checks whether a folder still exists.
 * Useful after delete operations.
 */
function folderExists(nodes: ExplorerNode[], folderId: string): boolean {
  return nodes.some((node) => {
    if (node.type === "folder" && node.id === folderId) return true;
    return node.type === "folder" ? folderExists(node.children, folderId) : false;
  });
}

/**
 * Updates a file's code content inside the tree.
 */
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

/**
 * Updates a file's language inside the tree.
 */
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

/**
 * Adds a new node inside a selected folder.
 */
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

/**
 * Renames any node by id.
 */
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

/**
 * Deletes a node by id from anywhere in the tree.
 */
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

/**
 * Collects all file nodes from the tree.
 * Used for open tabs rendering.
 */
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

/**
 * Collects all file ids under a node.
 * Useful when deleting folders and closing tabs inside them.
 */
function collectFileIdsFromNode(node: ExplorerNode): string[] {
  if (node.type === "file") return [node.id];
  return node.children.flatMap((child) => collectFileIdsFromNode(child));
}

/**
 * Returns the first folder id found in the tree.
 */
function getFirstFolderId(nodes: ExplorerNode[]): string {
  for (const node of nodes) {
    if (node.type === "folder") return node.id;
  }
  return "";
}

/**
 * Returns the first file found anywhere in the tree.
 */
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

/**
 * Converts internal language keys to UI labels.
 */
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
  const navigate = useNavigate();

  /**
   * Default workspace used before Firestore finishes loading
   * or for first-time users.
   */
  const defaultWorkspace = createDefaultWorkspace();

  const [terminalOpen, setTerminalOpen] = useState(false);
  const [desktopTerminalCollapsed, setDesktopTerminalCollapsed] = useState(false);
  const [terminalHeight, setTerminalHeight] = useState(220);
  const [explorerCollapsed, setExplorerCollapsed] = useState(false);
  const [sidebarPhotoURL, setSidebarPhotoURL] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  /**
   * Auth + workspace hydration states.
   *
   * currentUser:
   * The logged-in Firebase user.
   *
   * workspaceReady:
   * True when initial workspace load is done.
   *
   * isHydratingWorkspace:
   * Prevents autosave from firing while Firestore data is still loading.
   */
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [workspaceReady, setWorkspaceReady] = useState(false);
  const [isHydratingWorkspace, setIsHydratingWorkspace] = useState(true);

  const [language, setLanguage] = useState<CompilerLanguage>("java");

  /**
   * Workspace state.
   *
   * These are now persisted in Firestore.
   */
  const [projectTree, setProjectTree] = useState<ExplorerNode[]>(defaultWorkspace.tree);
  const [openFileIds, setOpenFileIds] = useState<string[]>(defaultWorkspace.openFileIds);
  const [activeFileId, setActiveFileId] = useState<string>(defaultWorkspace.activeFileId);
  const [selectedFolderId, setSelectedFolderId] = useState<string>(
    defaultWorkspace.selectedFolderId
  );

  const [bottomTab, setBottomTab] = useState<"output" | "problems" | "input">("output");
  const [stdin, setStdin] = useState("");
  const [output, setOutput] = useState<string[]>([
    "[4:10:19 AM] Workspace ready.",
    "Program output will appear here when Judge0 is connected.",
  ]);
  const [problems, setProblems] = useState<string[]>(["No problems detected."]);
  const [unsavedFileIds, setUnsavedFileIds] = useState<string[]>([]);
  const [dialogMode, setDialogMode] = useState<DialogMode>(null);
  const [targetNodeId, setTargetNodeId] = useState<string | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [newFileLanguage, setNewFileLanguage] =
    useState<CompilerLanguage>("java");
  const [mobileExplorerOpen, setMobileExplorerOpen] = useState(false);

  /**
   * Appends logs to the output terminal panel.
   */
  const appendLog = (message: string) => {
    setOutput((prev) => [...prev, message]);
  };

  /**
   * Auth listener:
   * - gets current user
   * - gets Google photo if available
   * - loads workspace from Firestore
   * - creates default workspace in Firestore if first time
   */
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (currentUser: FirebaseUser | null) => {
        setCurrentUser(currentUser);

        if (!currentUser) {
          setSidebarPhotoURL(null);
          setWorkspaceReady(false);
          setIsHydratingWorkspace(false);
          return;
        }

        

        const googlePhoto =
          currentUser.providerData.find(
            (provider) => provider.providerId === "google.com"
          )?.photoURL || null;

        setSidebarPhotoURL(googlePhoto || currentUser.photoURL || null);

        try {
          setIsHydratingWorkspace(true);

          const savedWorkspace = await loadWorkspace(currentUser.uid);

          if (savedWorkspace) {
            setProjectTree(savedWorkspace.tree);
            setOpenFileIds(savedWorkspace.openFileIds);
            setActiveFileId(savedWorkspace.activeFileId);
            setSelectedFolderId(savedWorkspace.selectedFolderId);

            const activeSavedFile = findFileById(
              savedWorkspace.tree,
              savedWorkspace.activeFileId
            );
            if (activeSavedFile) {
              setLanguage(activeSavedFile.language);
            }
          } else {
            const fallback = createDefaultWorkspace();

            setProjectTree(fallback.tree);
            setOpenFileIds(fallback.openFileIds);
            setActiveFileId(fallback.activeFileId);
            setSelectedFolderId(fallback.selectedFolderId);

            const fallbackFile = findFileById(
              fallback.tree,
              fallback.activeFileId
            );
            if (fallbackFile) {
              setLanguage(fallbackFile.language);
            }

            await saveWorkspace(currentUser.uid, fallback);
          }

          setWorkspaceReady(true);
        } catch (error) {
          console.error("Failed to load workspace:", error);
          appendLog(
            `[${new Date().toLocaleTimeString()}] Failed to load cloud workspace.`
          );
        } finally {
          setIsHydratingWorkspace(false);
        }
      }
    );

    return () => unsubscribe();
  }, []);

  /**
   * Automatically saves workspace changes to Firestore.
   *
   * Debounced by 500ms so typing does not spam writes too aggressively.
   */
  useEffect(() => {
    if (!currentUser || !workspaceReady || isHydratingWorkspace) return;

    const timeout = setTimeout(() => {
      saveWorkspace(currentUser.uid, {
        tree: projectTree,
        openFileIds,
        activeFileId,
        selectedFolderId,
      }).catch((error) => {
        console.error("Failed to save workspace:", error);
      });
    }, 500);

    return () => clearTimeout(timeout);
  }, [
    currentUser,
    workspaceReady,
    isHydratingWorkspace,
    projectTree,
    openFileIds,
    activeFileId,
    selectedFolderId,
  ]);

  const activeFile = useMemo(
    () => findFileById(projectTree, activeFileId),
    [projectTree, activeFileId]
  );

  const allFiles = useMemo(() => collectAllFiles(projectTree), [projectTree]);
  const targetNode = useMemo(
    () => (targetNodeId ? findNodeById(projectTree, targetNodeId) : null),
    [projectTree, targetNodeId]
  );

  /**
   * If selected folder gets deleted, switch to another existing folder.
   */
  useEffect(() => {
    if (!folderExists(projectTree, selectedFolderId)) {
      setSelectedFolderId(getFirstFolderId(projectTree));
    }
  }, [projectTree, selectedFolderId]);

  /**
   * Terminal resize logic for desktop.
   */
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const minHeight = 140;
      const maxHeight = Math.floor(window.innerHeight * 0.6);
      const nextHeight = window.innerHeight - event.clientY;

      setTerminalHeight(Math.min(Math.max(nextHeight, minHeight), maxHeight));
    };

    const handleMouseUp = () => {
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };

    const startResize = () => {
      document.body.style.cursor = "row-resize";
      document.body.style.userSelect = "none";
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    };

    (window as Window & { startTerminalResize?: () => void }).startTerminalResize =
      startResize;

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      delete (window as Window & { startTerminalResize?: () => void })
        .startTerminalResize;
    };
  }, []);

  /**
   * Opens create-folder dialog.
   */
  const openCreateFolderDialog = () => {
    setDialogMode("create-folder");
    setTargetNodeId(null);
    setNameInput("");
  };

  /**
   * Opens create-file dialog.
   */
  const openCreateFileDialog = () => {
    setDialogMode("create-file");
    setTargetNodeId(null);
    setNameInput("");
    setNewFileLanguage(language);
  };

  /**
   * Opens rename dialog for a selected node.
   */
  const openRenameDialog = (nodeId: string) => {
    const node = findNodeById(projectTree, nodeId);
    if (!node) return;

    setDialogMode("rename");
    setTargetNodeId(nodeId);
    setNameInput(node.name);
  };

  /**
   * Opens delete confirmation dialog.
   */
  const openDeleteDialog = (nodeId: string) => {
    const node = findNodeById(projectTree, nodeId);
    if (!node) return;

    setDialogMode("delete");
    setTargetNodeId(nodeId);
    setNameInput(node.name);
  };

  /**
   * Closes the active dialog and resets fields.
   */
  const closeDialog = () => {
    setDialogMode(null);
    setTargetNodeId(null);
    setNameInput("");
  };

  /**
   * Opens a file tab and makes it active.
   */
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

  /**
   * Closes a tab and switches active file if needed.
   */
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

  /**
   * Updates the current active file content.
   * Also marks file as unsaved.
   */
  const handleContentChange = (value: string) => {
    if (!activeFile) return;

    setProjectTree((prev) => updateFileContent(prev, activeFile.id, value));

    setUnsavedFileIds((prev) =>
      prev.includes(activeFile.id) ? prev : [...prev, activeFile.id]
    );
  };

  /**
   * Updates the active file language.
   * Also marks file as unsaved.
   */
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

  /**
   * Save button logic.
   *
   * Firestore autosave is already active,
   * so this currently acts like a manual "mark saved" action
   * and gives user feedback in terminal.
   */
  const handleSave = () => {
    if (!activeFile) return;

    setUnsavedFileIds((prev) => prev.filter((id) => id !== activeFile.id));
    appendLog(
      `[${new Date().toLocaleTimeString()}] Saved ${activeFile.name} successfully.`
    );
  };

  /**
   * Downloads the active file to the user's computer.
   */
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

  /**
   * Clears terminal output panel.
   */
  const handleClearOutput = () => {
    setOutput([`[${new Date().toLocaleTimeString()}] Output cleared.`]);
  };

  /**
   * Runs the current file using Judge0 service.
   */
  const handleRun = async () => {
    if (!activeFile || isRunning) return;

    if (activeFile.language === "html" || activeFile.language === "sql") {
      setBottomTab("problems");
      setProblems([
        `${formatLanguageLabel(
          activeFile.language
        )} execution is not connected yet.`,
        "HTML preview and SQL result/table rendering will be added later.",
      ]);
      setOutput((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] Run blocked for ${activeFile.name}.`,
      ]);
      return;
    }

    setBottomTab("output");
    setIsRunning(true);
    setProblems([]);

    setOutput([
      `[${new Date().toLocaleTimeString()}] Running ${activeFile.name} (${formatLanguageLabel(
        activeFile.language
      )})...`,
      stdin.trim()
        ? `[${new Date().toLocaleTimeString()}] Standard input detected.`
        : `[${new Date().toLocaleTimeString()}] No standard input provided.`,
    ]);

    try {
      const result = await runCode({
        sourceCode: activeFile.content,
        language: activeFile.language,
        stdin,
      });

      const nextProblems: string[] = [];

      if (result.compileOutput) {
        nextProblems.push(result.compileOutput);
      }

      if (result.stderr) {
        nextProblems.push(result.stderr);
      }

      if (result.message) {
        nextProblems.push(result.message);
      }

      setProblems(
        nextProblems.length > 0 ? nextProblems : ["No problems detected."]
      );

      setOutput((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] Status: ${result.status}`,
        result.stdout
          ? result.stdout
          : `[${new Date().toLocaleTimeString()}] Program finished with no stdout.`,
      ]);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred.";

      setProblems([message]);
      setBottomTab("problems");

      setOutput((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] Run failed for ${activeFile.name}.`,
      ]);
    } finally {
      setIsRunning(false);
    }
  };

  /**
   * Handles confirmation for create / rename / delete dialogs.
   */
  const handleDialogConfirm = () => {
    /**
     * CREATE FOLDER
     */
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

    /**
     * CREATE FILE
     */
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

    /**
     * RENAME NODE
     */
    if (dialogMode === "rename" && targetNode) {
      const trimmed = nameInput.trim();
      if (!trimmed) return;

      setProjectTree((prev) => renameNodeById(prev, targetNode.id, trimmed));
      appendLog(`Renamed "${targetNode.name}" to "${trimmed}".`);
      closeDialog();
      return;
    }

    /**
     * DELETE NODE
     */
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
          if (nextActiveFile) {
            setLanguage(nextActiveFile.language);
          }
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

  /**
   * Starts terminal drag-resize on desktop.
   */
  const handleTerminalResizeStart = () => {
    if (desktopTerminalCollapsed) return;

    const resizeFn = (window as Window & { startTerminalResize?: () => void })
      .startTerminalResize;

    resizeFn?.();
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
      ? "Create a new project folder in your workspace."
      : dialogMode === "create-file"
      ? "Create a new file inside the selected folder."
      : dialogMode === "rename"
      ? "Update the name of the selected item."
      : `This will remove "${targetNode?.name ?? ""}" from your workspace.`;

  /**
   * Loading screen while Firestore workspace is being restored.
   * Prevents flicker and prevents default data from flashing.
   */
  if (isHydratingWorkspace) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-foreground">
        <div className="rounded-2xl border border-border bg-card/50 px-6 py-5 shadow-xl shadow-primary/5">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-primary">
            Judge-Compilo
          </p>
          <h2 className="mt-2 font-mono text-lg font-semibold">
            Loading workspace...
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Restoring your folders and files from Firestore.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
        <FileExplorer
          tree={projectTree}
          selectedFolderId={selectedFolderId}
          activeFileId={activeFileId}
          mobileOpen={mobileExplorerOpen}
          collapsed={explorerCollapsed}
          onCloseMobile={() => setMobileExplorerOpen(false)}
          onToggleCollapse={() => setExplorerCollapsed((prev) => !prev)}
          onSelectFolder={setSelectedFolderId}
          onOpenFile={handleOpenFile}
          onCreateFolder={openCreateFolderDialog}
          onCreateFile={openCreateFileDialog}
          onRenameNode={openRenameDialog}
          onDeleteNode={openDeleteDialog}
          onProfileClick={() => navigate("/profile")}
          userPhotoURL={sidebarPhotoURL}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar
            language={language}
            activeFileName={activeFile?.name ?? "No file selected"}
            isRunning={isRunning}
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

          <div className="border-t border-border bg-card/80 px-3 py-2 lg:hidden">
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
              stdin={stdin}
              onChangeTab={setBottomTab}
              onStdinChange={setStdin}
              onClearOutput={handleClearOutput}
              collapsed={desktopTerminalCollapsed}
              height={terminalHeight}
              onResizeStart={handleTerminalResizeStart}
              onToggleCollapse={() =>
                setDesktopTerminalCollapsed((prev) => !prev)
              }
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
                This action will also persist to Firestore workspace storage.
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