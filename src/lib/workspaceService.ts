import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import type { ExplorerNode } from "../pages/CompilerWorkspace";

/**
 * Shape of the workspace data stored in Firestore.
 *
 * We keep the full workspace in a single document for now
 * because it matches your current CompilerWorkspace state.
 */
export type WorkspaceData = {
  tree: ExplorerNode[];
  openFileIds: string[];
  activeFileId: string;
  selectedFolderId: string;
};

/**
 * Returns the Firestore document reference for one user's workspace.
 *
 * Path:
 * users/{uid}/workspace/main
 */
const getWorkspaceRef = (uid: string) =>
  doc(db, "users", uid, "workspace", "main");

/**
 * Loads the user's workspace from Firestore.
 * Returns null if no saved workspace exists yet.
 */
export async function loadWorkspace(uid: string): Promise<WorkspaceData | null> {
  try {
    const workspaceRef = getWorkspaceRef(uid);
    const snapshot = await getDoc(workspaceRef);

    if (!snapshot.exists()) return null;

    const data = snapshot.data();

    return {
      tree: Array.isArray(data.tree) ? data.tree : [],
      openFileIds: Array.isArray(data.openFileIds) ? data.openFileIds : [],
      activeFileId:
        typeof data.activeFileId === "string" ? data.activeFileId : "",
      selectedFolderId:
        typeof data.selectedFolderId === "string" ? data.selectedFolderId : "",
    };
  } catch (error) {
    console.error("Failed to load workspace:", error);
    throw error;
  }
}

/**
 * Saves the full workspace to Firestore.
 *
 * merge: true allows safe updates without replacing unrelated fields
 * if you add more fields in the future.
 */
export async function saveWorkspace(uid: string, data: WorkspaceData) {
  try {
    const workspaceRef = getWorkspaceRef(uid);

    await setDoc(
      workspaceRef,
      {
        tree: data.tree,
        openFileIds: data.openFileIds,
        activeFileId: data.activeFileId,
        selectedFolderId: data.selectedFolderId,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (error) {
    console.error("Failed to save workspace:", error);
    throw error;
  }
}