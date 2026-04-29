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
import { runSql } from "../lib/sqlRunner";
import { saveCompilerLog } from "../lib/compilerLogService";
import {
  defaultAdminSettings,
  subscribeAdminSettings,
  type AdminSettingsData,
  type CompilerFeatureId,
} from "../lib/adminSettingsService";

export type CompilerLanguage =
  | "javascript"
  | "typescript"
  | "python"
  | "java"
  | "c"
  | "cpp"
  | "csharp"
  | "php"
  | "sql"
  | "html"
  | "css";

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
  "php",
  "sql",
  "html",
  "css",
];

/**
 * Backend URL used for Java GUI sandbox calls.
 *
 * Uses Vite env first if available.
 * Falls back to localhost backend during development.
 */
const BACKEND_URL =
  import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

/**
 * Java GUI detection hints.
 *
 * If any of these appear in a Java file,
 * we treat the file as a Swing/AWT GUI app
 * and run it through the Java GUI backend route.
 */
const JAVA_GUI_HINTS = [
  "javax.swing",
  "java.awt",
  "SwingUtilities",
  "JFrame",
  "JPanel",
  "JButton",
  "JLabel",
  "JTextField",
  "JTextArea",
  "JCheckBox",
  "JRadioButton",
  "JComboBox",
  "JTable",
  "JScrollPane",
  "JDialog",
  "JOptionPane",
  "setVisible(true)",
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
  php: `<?php
echo "Hello from Judge-Compilo";
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
  css: `body {
  font-family: Arial, sans-serif;
  padding: 24px;
  background: #0f172a;
  color: white;
}

h1 {
  color: #38bdf8;
}
`,
};

/**
 * Finds the folder that directly contains the given file id.
 */
function findParentFolderOfFile(
  nodes: ExplorerNode[],
  fileId: string
): ExplorerFolder | null {
  for (const node of nodes) {
    if (node.type === "folder") {
      const hasDirectChild = node.children.some(
        (child) => child.type === "file" && child.id === fileId
      );

      if (hasDirectChild) return node;

      const nested = findParentFolderOfFile(node.children, fileId);
      if (nested) return nested;
    }
  }

  return null;
}

/**
 * Escapes a closing </script> tag inside JS content
 * so injected inline scripts do not break the HTML string.
 */
function escapeInlineScriptContent(code: string): string {
  return code.replace(/<\/script>/gi, "<\\/script>");
}

/**
 * Builds the final preview HTML by injecting CSS and JS
 * from sibling files in the same folder.
 */
function buildPreviewDocument(
  html: string,
  cssBlocks: string[],
  jsBlocks: string[]
): string {
  const cssTag = cssBlocks.length
    ? `\n<style>\n${cssBlocks.join("\n\n")}\n</style>\n`
    : "";

  const jsTag = jsBlocks.length
    ? `\n<script>\n${escapeInlineScriptContent(jsBlocks.join("\n\n"))}\n</script>\n`
    : "";

  let nextHtml = html;

  if (cssTag) {
    if (/<\/head>/i.test(nextHtml)) {
      nextHtml = nextHtml.replace(/<\/head>/i, `${cssTag}</head>`);
    } else {
      nextHtml = cssTag + nextHtml;
    }
  }

  if (jsTag) {
    if (/<\/body>/i.test(nextHtml)) {
      nextHtml = nextHtml.replace(/<\/body>/i, `${jsTag}</body>`);
    } else {
      nextHtml = nextHtml + jsTag;
    }
  }

  return nextHtml;
}

/**
 * Returns true if the Java source looks like Swing/AWT GUI code.
 */
function isJavaGuiSource(code: string): boolean {
  const normalized = code.toLowerCase();

  return JAVA_GUI_HINTS.some((hint) =>
    normalized.includes(hint.toLowerCase())
  );
}

/**
 * Creates a file node with starter content.
 */
function getExtensionByLanguage(language: CompilerLanguage): string {
  const map: Record<CompilerLanguage, string> = {
    javascript: "js",
    typescript: "ts",
    python: "py",
    java: "java",
    c: "c",
    cpp: "cpp",
    csharp: "cs",
    php: "php",
    sql: "sql",
    html: "html",
    css: "css",
  };

  return map[language];
}

function ensureFileNameHasExtension(
  name: string,
  language: CompilerLanguage
): string {
  const trimmed = name.trim();
  const expectedExtension = getExtensionByLanguage(language);

  if (!trimmed) {
    return `untitled.${expectedExtension}`;
  }

  const lowerTrimmed = trimmed.toLowerCase();
  const expectedSuffix = `.${expectedExtension}`;

  if (lowerTrimmed.endsWith(expectedSuffix)) {
    return trimmed;
  }

  return `${trimmed}.${expectedExtension}`;
}

function getDefaultFileName(language: CompilerLanguage): string {
  const map: Record<CompilerLanguage, string> = {
    javascript: "script.js",
    typescript: "main.ts",
    python: "main.py",
    java: "Main.java",
    c: "main.c",
    cpp: "main.cpp",
    csharp: "Program.cs",
    php: "index.php",
    sql: "query.sql",
    html: "index.html",
    css: "style.css",
  };

  return map[language];
}

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
  return [];
}

/**
 * Returns a complete default workspace state.
 * Used the first time a user's cloud workspace is created.
 */
function createDefaultWorkspace() {
  return {
    tree: createDefaultProjectTree(),
    openFileIds: [],
    activeFileId: "",
    selectedFolderId: "",
  };
}

/**
 * Searches the whole tree and returns a file by id.
 */
function findFileById(
  nodes: ExplorerNode[],
  fileId: string
): ExplorerFile | null {
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
function findNodeById(
  nodes: ExplorerNode[],
  nodeId: string
): ExplorerNode | null {
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
    php: "PHP",
    sql: "SQL",
    html: "HTML",
    css: "CSS",
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
const [hasSqlResult, setHasSqlResult] = useState(false);

const [adminSettings, setAdminSettings] =
  useState<AdminSettingsData>(defaultAdminSettings);

  /**
   * SQL result viewer state.
   *
   * sqlRows:
   * Stores row-based results from SELECT queries.
   *
   * sqlMetaMessage:
   * Stores execution summaries for SQL queries.
   *
   * sqlResultOpen:
   * Controls the centered SQL results modal.
   */
  const [sqlRows, setSqlRows] = useState<Record<string, any>[]>([]);
  const [sqlMetaMessage, setSqlMetaMessage] = useState("");
  const [sqlResultOpen, setSqlResultOpen] = useState(false);

  /**
   * Java GUI session state.
   *
   * javaGuiPreviewUrl:
   * Stores the noVNC preview URL returned by the backend.
   *
   * javaGuiContainerName:
   * Tracks the running Docker container so we can stop it before reruns.
   */
  const [javaGuiPreviewUrl, setJavaGuiPreviewUrl] = useState("");
  const [javaGuiContainerName, setJavaGuiContainerName] = useState("");
  const [javaGuiModalOpen, setJavaGuiModalOpen] = useState(false);

  /**
   * Auth + workspace hydration states.
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
  const [projectTree, setProjectTree] = useState<ExplorerNode[]>(
    defaultWorkspace.tree
  );
  const [openFileIds, setOpenFileIds] = useState<string[]>(
    defaultWorkspace.openFileIds
  );
  const [activeFileId, setActiveFileId] = useState<string>(
    defaultWorkspace.activeFileId
  );
  const [selectedFolderId, setSelectedFolderId] = useState<string>(
    defaultWorkspace.selectedFolderId
  );

  /**
   * Bottom terminal tabs.
   * Preview is handled in a new browser tab for HTML files.
   */
 const [bottomTab, setBottomTab] = useState<"output" | "problems" | "input" | "preview">(
  "output"
);
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
 * Admin settings listener:
 * Keeps compiler behavior synced with Firestore admin settings.
 */
useEffect(() => {
  const unsubscribe = subscribeAdminSettings((settingsData) => {
    setAdminSettings(settingsData);
  });

  return () => unsubscribe();
}, []);

/**
 * isFeatureEnabled
 *
 * Purpose:
 * Checks if a compiler feature is enabled by the admin.
 */
const isFeatureEnabled = (featureId: CompilerFeatureId) => {
  return adminSettings.compilerFeatures.some(
    (feature) => feature.id === featureId && feature.enabled
  );
};

/**
 * blockByAdminSettings
 *
 * Purpose:
 * Shows a terminal/problem message when an admin setting blocks a feature.
 */
const blockByAdminSettings = (message: string) => {
  setProblems([message]);
  setBottomTab("problems");
  setOutput((prev) => [
    ...prev,
    `[${new Date().toLocaleTimeString()}] ${message}`,
  ]);
};

  /**
   * Stops the currently tracked Java GUI session.
   *
   * Safe to call even if there is no session running.
   */
  const stopJavaGuiSession = async (containerName?: string) => {
    const targetName = containerName || javaGuiContainerName;
    if (!targetName) return;

    try {
      await fetch(
        `${BACKEND_URL}/api/java-gui/stop/${encodeURIComponent(targetName)}`,
        {
          method: "DELETE",
        }
      );
    } catch (error) {
      console.error("Failed to stop Java GUI session:", error);
    }
  };

  /**
   * Closes the SQL results modal when the Escape key is pressed.
   */
  useEffect(() => {
    if (!sqlResultOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSqlResultOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [sqlResultOpen]);

  /**
   * Cleanup any running Java GUI container when the workspace unmounts
   * or when a newer container replaces the previous one.
   */
  useEffect(() => {
    return () => {
      if (javaGuiContainerName) {
        void stopJavaGuiSession(javaGuiContainerName);
      }
    };
  }, [javaGuiContainerName]);

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
   *
   * If a folder id is provided, we remember that folder
   * so the new file is created inside the clicked folder.
   * If not provided, we fall back to the currently selected folder.
   */
  const openCreateFileDialog = (folderId?: string) => {
    const initialLanguage = language;

    setDialogMode("create-file");
    setTargetNodeId(folderId ?? selectedFolderId);
    setNewFileLanguage(initialLanguage);
    setNameInput(getDefaultFileName(initialLanguage));
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

  const showShowTablesButton =
    activeFile?.type === "file" && activeFile.language === "sql";

  /**
   * SQL result table helpers.
   *
   * showSqlResultsButton:
   * Only show the topbar SQL Results button when the active file is SQL
   * and there are rows available to preview.
   *
   * sqlColumns:
   * Uses the first row to determine visible table columns.
   */
  const showSqlResultsButton =
    activeFile?.type === "file" &&
    activeFile.language === "sql" &&
    hasSqlResult;

  const sqlColumns = sqlRows.length > 0 ? Object.keys(sqlRows[0]) : [];

const handleShowTables = async () => {
  if (!currentUser?.uid) {
    setProblems(["You must be logged in to view SQL tables."]);
    setBottomTab("problems");
    return;
  }

  if (adminSettings.maintenanceMode) {
    blockByAdminSettings("Compilo is currently in maintenance mode.");
    return;
  }

  if (!isFeatureEnabled("sql")) {
    blockByAdminSettings("SQL Sandbox is currently disabled by the administrator.");
    return;
  }

  try {
    setIsRunning(true);
    setBottomTab("output");

    setOutput((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] Loading tables from your SQL sandbox...`,
    ]);

    const result = await runSql("SHOW TABLES", currentUser.uid);

    setSqlRows(Array.isArray(result) ? result : []);
    setSqlMetaMessage(
      Array.isArray(result)
        ? `Found ${result.length} table(s) in your sandbox.`
        : "Tables loaded successfully."
    );
    setHasSqlResult(true);
    setSqlResultOpen(true);
    setProblems(["No problems detected."]);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load tables.";

    setProblems([message]);
    setBottomTab("problems");
  } finally {
    setIsRunning(false);
  }
};

  /**
   * Opens the active HTML file in a new browser tab.
   * This is used instead of rendering HTML inside the terminal panel.
   */
const handlePreviewHtml = () => {
  if (!activeFile || activeFile.language !== "html") return;

  if (adminSettings.maintenanceMode) {
    blockByAdminSettings("Compilo is currently in maintenance mode.");
    return;
  }

  if (!isFeatureEnabled("html-preview")) {
    blockByAdminSettings(
      "HTML Preview is currently disabled by the administrator."
    );
    return;
  }

  const parentFolder = findParentFolderOfFile(projectTree, activeFile.id);

  const siblingFiles =
    parentFolder?.children.filter(
      (child): child is ExplorerFile =>
        child.type === "file" && child.id !== activeFile.id
    ) ?? [];

  const cssFiles = siblingFiles.filter(
    (file) => file.language === "css" || file.name.toLowerCase().endsWith(".css")
  );

  const jsFiles = siblingFiles.filter(
    (file) =>
      file.language === "javascript" || file.name.toLowerCase().endsWith(".js")
  );

  const previewHtml = buildPreviewDocument(
    activeFile.content,
    cssFiles.map((file) => file.content),
    jsFiles.map((file) => file.content)
  );

  const previewWindow = window.open("", "_blank");

  if (!previewWindow) {
    setProblems([
      "Preview popup was blocked by the browser.",
      "Allow popups for this site and try again.",
    ]);
    setBottomTab("problems");
    return;
  }

  previewWindow.document.open();
  previewWindow.document.write(previewHtml);
  previewWindow.document.close();

  setOutput((prev) => [
    ...prev,
    `[${new Date().toLocaleTimeString()}] Opened preview for ${activeFile.name}.`,
    `[${new Date().toLocaleTimeString()}] Included ${cssFiles.length} CSS file(s) and ${jsFiles.length} JS file(s) from the same folder.`,
  ]);
};

  /**
   * Runs the active Java file through the Java GUI backend route.
   *
   * This is only used for Swing/AWT Java code.
   * Regular Java console programs still use Judge0 below.
   */
const handleRunJavaGui = async (file: ExplorerFile) => {
  if (adminSettings.maintenanceMode) {
    blockByAdminSettings("Compilo is currently in maintenance mode.");
    return;
  }

  if (!isFeatureEnabled("java-gui")) {
    blockByAdminSettings(
      "Java GUI Preview is currently disabled by the administrator."
    );
    return;
  }

  setBottomTab("output");
  setProblems([]);
  setIsRunning(true);

  setOutput([
    `[${new Date().toLocaleTimeString()}] Running ${file.name} as Java GUI...`,
    `[${new Date().toLocaleTimeString()}] Starting sandbox container and noVNC preview...`,
  ]);

  try {
    if (javaGuiContainerName) {
      await stopJavaGuiSession(javaGuiContainerName);
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    setJavaGuiPreviewUrl("");
    setJavaGuiContainerName("");

    const response = await fetch(`${BACKEND_URL}/api/java-gui/run`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code: file.content,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || "Failed to run Java GUI.");
    }

    setJavaGuiPreviewUrl(data.previewUrl);
    setJavaGuiContainerName(data.containerName);
    setBottomTab("preview");

    setProblems(["No problems detected."]);

    setOutput((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] Java GUI container started successfully.`,
      `[${new Date().toLocaleTimeString()}] Preview is ready in the Preview tab.`,
    ]);

    await saveCompilerLog({
      language: file.language,
      fileName: file.name,
      status: "success",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to run Java GUI.";

    setProblems([message]);
    setBottomTab("problems");
    setJavaGuiPreviewUrl("");
    setJavaGuiContainerName("");

    setOutput((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] Java GUI run failed for ${file.name}.`,
    ]);

    await saveCompilerLog({
      language: file.language,
      fileName: file.name,
      status: "failed",
      error: message,
    });
  } finally {
    setIsRunning(false);
  }
};

  /**
   * Runs the current file using Judge0 service.
   *
   * Special cases:
   * - HTML/CSS do not run through Judge0.
   * - SQL runs through your backend.
   * - Java Swing/AWT GUI runs through the Java GUI backend.
   */
const handleRun = async () => {
  if (!activeFile || isRunning) return;

  if (adminSettings.maintenanceMode) {
    blockByAdminSettings("Compilo is currently in maintenance mode.");
    return;
  }

  /**
   * HTML and CSS do not run through Judge0.
   * Users should use the Preview button instead.
   */
  if (activeFile.language === "html" || activeFile.language === "css") {
    setProblems([
      `${formatLanguageLabel(activeFile.language)} does not run through Judge0.`,
      "Use the Preview button from an HTML file to open it in a new tab.",
    ]);
    setBottomTab("problems");
    setOutput((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] Run blocked for ${activeFile.name}. Use Preview instead.`,
    ]);
    return;
  }

  /**
   * Java GUI files run through your Java GUI backend route.
   * Regular Java console files continue using Judge0.
   */
  if (activeFile.language === "java" && isJavaGuiSource(activeFile.content)) {
    await handleRunJavaGui(activeFile);
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
    /**
     * SQL runs through your backend, not Judge0.
     */
    if (activeFile.language === "sql") {
      if (!currentUser?.uid) {
        throw new Error("You must be logged in to use SQL sandbox.");
      }

      if (!isFeatureEnabled("sql")) {
        throw new Error("SQL Sandbox is currently disabled by the administrator.");
      }

      const result = await runSql(activeFile.content, currentUser.uid);

      setSqlRows(Array.isArray(result) ? result : []);
      setSqlMetaMessage(
        Array.isArray(result)
          ? `Returned ${result.length} row(s).`
          : "Query executed successfully."
      );
      setSqlResultOpen(false);
      setHasSqlResult(true);
      setProblems(["No problems detected."]);

      setOutput((prev) => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] SQL executed successfully.`,
        Array.isArray(result)
          ? `[${new Date().toLocaleTimeString()}] Returned ${result.length} row(s).`
          : `[${new Date().toLocaleTimeString()}] Query executed successfully.`,
      ]);

      await saveCompilerLog({
        language: activeFile.language,
        fileName: activeFile.name,
        status: "success",
      });

      return;
    }

    /**
     * Clear old SQL table data when running non-SQL files
     * so stale results do not remain available in the UI.
     */
    setSqlRows([]);
    setSqlMetaMessage("");
    setSqlResultOpen(false);
    setHasSqlResult(false);

    if (!isFeatureEnabled("judge0")) {
      throw new Error("Judge0 Compiler is currently disabled by the administrator.");
    }

    const result = await runCode({
      sourceCode: activeFile.content,
      language: activeFile.language as Exclude<
        CompilerLanguage,
        "html" | "css" | "sql"
      >,
      stdin,
    });

    const nextProblems: string[] = [];

    if (result.compileOutput) nextProblems.push(result.compileOutput);
    if (result.stderr) nextProblems.push(result.stderr);
    if (result.message) nextProblems.push(result.message);

    const runFailed = nextProblems.length > 0;

    setProblems(runFailed ? nextProblems : ["No problems detected."]);

    setOutput((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] Status: ${result.status}`,
      result.stdout
        ? result.stdout
        : `[${new Date().toLocaleTimeString()}] Program finished with no stdout.`,
    ]);

    await saveCompilerLog({
      language: activeFile.language,
      fileName: activeFile.name,
      status: runFailed ? "failed" : "success",
      error: runFailed ? nextProblems.join("\n") : "",
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error occurred.";

    setSqlRows([]);
    setSqlMetaMessage("");
    setSqlResultOpen(false);
    setHasSqlResult(false);

    setProblems([message]);
    setBottomTab("problems");

    setOutput((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] Run failed for ${activeFile.name}.`,
    ]);

    await saveCompilerLog({
      language: activeFile.language,
      fileName: activeFile.name,
      status: "failed",
      error: message,
    });
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

      const folderId =
        targetNodeId || selectedFolderId || getFirstFolderId(projectTree);

      if (!folderId) return;

      const finalFileName = ensureFileNameHasExtension(
        trimmed,
        newFileLanguage
      );

      const newFile = createFile(
        `file-${Date.now()}`,
        finalFileName,
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

      const nextName =
        targetNode.type === "file"
          ? ensureFileNameHasExtension(trimmed, targetNode.language)
          : trimmed;

      setProjectTree((prev) => renameNodeById(prev, targetNode.id, nextName));
      appendLog(`Renamed "${targetNode.name}" to "${nextName}".`);
      closeDialog();
      return;
    }

    /**
     * DELETE NODE
     */
    if (dialogMode === "delete" && targetNode) {
      const deletedFileIds = collectFileIdsFromNode(targetNode);
      const nextTree = deleteNodeById(projectTree, targetNode.id);
      const nextOpenIds = openFileIds.filter(
        (id) => !deletedFileIds.includes(id)
      );
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
    {adminSettings.maintenanceMode && (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 px-4 backdrop-blur-sm">
        <div className="w-full max-w-lg rounded-3xl border border-red-500/30 bg-card p-8 text-center shadow-2xl shadow-red-500/20">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 text-red-500">
            <span className="text-3xl">⚠️</span>
          </div>

          <p className="mt-6 font-mono text-xs font-bold uppercase tracking-[0.3em] text-red-400">
            Maintenance Mode
          </p>

          <h2 className="mt-3 font-mono text-2xl font-bold text-foreground">
            Compilo is temporarily unavailable
          </h2>

          <p className="mt-4 text-sm leading-6 text-muted-foreground">
            The administrator has temporarily disabled compiler access for
            maintenance. Please try again later.
          </p>

          <div className="mt-6 rounded-2xl border border-border bg-background/70 px-4 py-3">
            <p className="font-mono text-xs text-muted-foreground">
              Your files are safe. Workspace autosave remains preserved in
              Firestore.
            </p>
          </div>

          <button
            onClick={() => navigate("/profile")}
            className="mt-6 rounded-xl border border-border bg-background px-5 py-3 font-mono text-sm font-semibold text-foreground transition hover:border-primary hover:text-primary"
          >
            Go to Profile
          </button>
        </div>
      </div>
    )}

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
  isRunning={isRunning}
  showPreviewButton={
    activeFile?.language === "html" &&
    !adminSettings.maintenanceMode &&
    isFeatureEnabled("html-preview")
  }
  showSqlResultsButton={showSqlResultsButton}
  showShowTablesButton={
    showShowTablesButton &&
    !adminSettings.maintenanceMode &&
    isFeatureEnabled("sql")
  }
  showJavaGuiButton={
    activeFile?.language === "java" &&
    activeFile?.type === "file" &&
    isJavaGuiSource(activeFile.content) &&
    !adminSettings.maintenanceMode &&
    isFeatureEnabled("java-gui")
  }
  disableRun={
    adminSettings.maintenanceMode ||
    activeFile?.language === "html" ||
    activeFile?.language === "css"
  }
  onSave={handleSave}
  onRun={handleRun}
  onRunJavaGui={() => {
    if (activeFile && activeFile.language === "java") {
      void handleRunJavaGui(activeFile);
    }
  }}
  onPreviewHtml={handlePreviewHtml}
  onOpenSqlResults={() => setSqlResultOpen(true)}
  onShowTables={handleShowTables}
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
                    onClick={() => openCreateFileDialog()}
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
              hasGuiPreview={Boolean(javaGuiPreviewUrl)}
              onOpenGuiPreview={() => setJavaGuiModalOpen(true)}
              onChangeTab={setBottomTab}
              onStdinChange={setStdin}
              onClearOutput={handleClearOutput}
              collapsed={desktopTerminalCollapsed}
              height={terminalHeight}
              onToggleCollapse={() =>
                setDesktopTerminalCollapsed((prev) => !prev)
              }
              onResizeStart={handleTerminalResizeStart}
            />
          </div>
        </div>
      </div>

      {javaGuiModalOpen && javaGuiPreviewUrl && (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
    onClick={() => setJavaGuiModalOpen(false)}
  >
    <div
      className="flex h-[88vh] w-full max-w-7xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-primary/10"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-primary">
            Judge-Compilo
          </p>
          <h3 className="mt-2 font-mono text-xl font-semibold text-foreground">
            Java GUI Preview
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Live sandbox preview powered by noVNC.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.open(javaGuiPreviewUrl, "_blank")}
            className="rounded-xl border border-border bg-background px-4 py-2 font-mono text-sm transition hover:border-primary hover:text-primary"
          >
            Open in New Tab
          </button>

          <button
            onClick={() => setJavaGuiModalOpen(false)}
            className="rounded-xl border border-border bg-background px-4 py-2 font-mono text-sm transition hover:border-primary hover:text-primary"
          >
            Close
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1 bg-black p-4">
<iframe
  key={javaGuiPreviewUrl}
  src={`${javaGuiPreviewUrl}?autoconnect=1&reconnect=1&resize=remote&_=${Date.now()}`}
  title="Java GUI Preview"
  className="h-full w-full rounded-xl border border-border bg-black"
/>
      </div>
    </div>
  </div>
)}

      {sqlResultOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm"
          onClick={() => setSqlResultOpen(false)}
        >
          <div
            className="flex h-[85vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl shadow-primary/10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.28em] text-primary">
                  Judge-Compilo
                </p>
                <h3 className="mt-2 font-mono text-xl font-semibold text-foreground">
                  SQL Results
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {sqlMetaMessage || "Result preview"}
                </p>
              </div>

              <button
                onClick={() => setSqlResultOpen(false)}
                className="rounded-xl border border-border bg-background px-4 py-2 font-mono text-sm transition hover:border-primary hover:text-primary"
              >
                Close
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-auto px-6 py-5">
              {sqlRows.length === 0 ? (
                <div className="flex min-h-[220px] items-center justify-center rounded-xl border border-dashed border-border bg-background/70 px-6 py-8 text-center">
                  <div>
                    <p className="font-mono text-sm text-foreground">
                      No row data available.
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      This query returned 0 rows, so there is nothing to preview
                      in the table.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-border bg-background">
                  <table className="min-w-full border-collapse font-mono text-sm">
                    <thead className="sticky top-0 z-10 bg-card/95 backdrop-blur">
                      <tr>
                        {sqlColumns.map((column) => (
                          <th
                            key={column}
                            className="border-b border-border px-4 py-3 text-left font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground"
                          >
                            {column}
                          </th>
                        ))}
                      </tr>
                    </thead>

                    <tbody>
                      {sqlRows.map((row, rowIndex) => (
                        <tr
                          key={rowIndex}
                          className="border-b border-border/70 transition hover:bg-primary/5 odd:bg-background even:bg-background/40 last:border-b-0"
                        >
                          {sqlColumns.map((column) => {
                            const value = row[column];

                            return (
                              <td
                                key={`${rowIndex}-${column}`}
                                className="px-4 py-3 align-top text-foreground whitespace-pre-wrap break-words"
                              >
                                {value === null ? (
                                  <span className="inline-flex rounded-md border border-border bg-card px-2 py-1 text-xs uppercase tracking-wide text-muted-foreground">
                                    NULL
                                  </span>
                                ) : typeof value === "object" ? (
                                  JSON.stringify(value)
                                ) : (
                                  String(value)
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

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
                      dialogMode === "create-file"
                        ? getDefaultFileName(newFileLanguage)
                        : "my-project"
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
                      onChange={(e) => {
                        const nextLanguage = e.target
                          .value as CompilerLanguage;
                        setNewFileLanguage(nextLanguage);
                        setNameInput(getDefaultFileName(nextLanguage));
                      }}
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