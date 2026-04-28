import {
  addDoc,
  collection,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  where,
} from "firebase/firestore";
import { auth, db } from "../firebase/config";
import type { CompilerLanguage } from "../pages/CompilerWorkspace";

export type CompilerRunStatus = "success" | "failed";

export type CompilerLog = {
  id?: string;
  uid: string;
  email: string;
  language: CompilerLanguage;
  fileName: string;
  status: CompilerRunStatus;
  error?: string;
  createdAt?: Timestamp;
};

/**
 * saveCompilerLog
 *
 * Purpose:
 * Saves a compiler run history record for admin monitoring.
 */
export async function saveCompilerLog(params: {
  language: CompilerLanguage;
  fileName: string;
  status: CompilerRunStatus;
  error?: string;
}) {
  const currentUser = auth.currentUser;

  if (!currentUser) {
    return;
  }

  await addDoc(collection(db, "compilerLogs"), {
    uid: currentUser.uid,
    email: currentUser.email || "",
    language: params.language,
    fileName: params.fileName,
    status: params.status,
    error: params.error || "",
    createdAt: serverTimestamp(),
  });
}

/**
 * getRecentCompilerLogs
 *
 * Purpose:
 * Gets recent compiler runs for admin dashboard tables.
 */
export async function getRecentCompilerLogs(maxResults = 10): Promise<CompilerLog[]> {
  const logsQuery = query(
    collection(db, "compilerLogs"),
    orderBy("createdAt", "desc"),
    limit(maxResults)
  );

  const snapshot = await getDocs(logsQuery);

  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...(docSnap.data() as Omit<CompilerLog, "id">),
  }));
}

/**
 * getAllCompilerLogs
 *
 * Purpose:
 * Gets compiler logs for admin analytics.
 */
export async function getAllCompilerLogs(): Promise<CompilerLog[]> {
  const logsQuery = query(
    collection(db, "compilerLogs"),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(logsQuery);

  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...(docSnap.data() as Omit<CompilerLog, "id">),
  }));
}

/**
 * getTodayCompilerLogs
 *
 * Purpose:
 * Gets today's compiler logs for dashboard counters.
 */
export async function getTodayCompilerLogs(): Promise<CompilerLog[]> {
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const logsQuery = query(
    collection(db, "compilerLogs"),
    where("createdAt", ">=", Timestamp.fromDate(startOfToday)),
    orderBy("createdAt", "desc")
  );

  const snapshot = await getDocs(logsQuery);

  return snapshot.docs.map((docSnap) => ({
    id: docSnap.id,
    ...(docSnap.data() as Omit<CompilerLog, "id">),
  }));
}

/**
 * subscribeRecentCompilerLogs
 *
 * Purpose:
 * Realtime listener for recent compiler logs.
 * Used by admin dashboard so it updates automatically.
 */
export function subscribeRecentCompilerLogs(
  maxResults: number,
  callback: (logs: CompilerLog[]) => void
) {
  const logsQuery = query(
    collection(db, "compilerLogs"),
    orderBy("createdAt", "desc"),
    limit(maxResults)
  );

  return onSnapshot(logsQuery, (snapshot) => {
    const logs = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<CompilerLog, "id">),
    }));

    callback(logs);
  });
}

/**
 * subscribeAllCompilerLogs
 *
 * Purpose:
 * Realtime listener for all compiler logs.
 * Used by admin dashboard counters and analytics.
 */
export function subscribeAllCompilerLogs(
  callback: (logs: CompilerLog[]) => void
) {
  const logsQuery = query(
    collection(db, "compilerLogs"),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(logsQuery, (snapshot) => {
    const logs = snapshot.docs.map((docSnap) => ({
      id: docSnap.id,
      ...(docSnap.data() as Omit<CompilerLog, "id">),
    }));

    callback(logs);
  });
}