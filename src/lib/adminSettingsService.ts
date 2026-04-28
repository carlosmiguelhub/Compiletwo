import {
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "../firebase/config";

export type AdminTheme = "system" | "light" | "dark";

export type CompilerFeatureId =
  | "judge0"
  | "sql"
  | "html-preview"
  | "java-gui";

export type CompilerFeatureSetting = {
  id: CompilerFeatureId;
  label: string;
  description: string;
  enabled: boolean;
};

export type AdminSettingsData = {
  maintenanceMode: boolean;
  theme: AdminTheme;
  maxRunLimit: number;
  maxFilesPerUser: number;
  compilerFeatures: CompilerFeatureSetting[];
  updatedAt?: unknown;
};

export const defaultAdminSettings: AdminSettingsData = {
  maintenanceMode: false,
  theme: "system",
  maxRunLimit: 100,
  maxFilesPerUser: 50,
  compilerFeatures: [
    {
      id: "judge0",
      label: "Judge0 Compiler",
      description:
        "Allow users to run JavaScript, TypeScript, Python, Java, C, C++, C#, and PHP.",
      enabled: true,
    },
    {
      id: "sql",
      label: "SQL Sandbox",
      description:
        "Allow users to run SQL queries through the backend MySQL sandbox.",
      enabled: true,
    },
    {
      id: "html-preview",
      label: "HTML Preview",
      description:
        "Allow users to preview HTML/CSS/JavaScript projects in the browser.",
      enabled: true,
    },
    {
      id: "java-gui",
      label: "Java GUI Preview",
      description:
        "Allow users to launch Java Swing/AWT GUI previews through Docker and noVNC.",
      enabled: true,
    },
  ],
};

const adminSettingsRef = doc(db, "adminSettings", "main");

/**
 * subscribeAdminSettings
 *
 * Purpose:
 * Realtime listener for admin settings.
 */
export function subscribeAdminSettings(
  callback: (settings: AdminSettingsData) => void
) {
  return onSnapshot(
    adminSettingsRef,
    async (snapshot) => {
      if (!snapshot.exists()) {
        await setDoc(adminSettingsRef, {
          ...defaultAdminSettings,
          updatedAt: serverTimestamp(),
        });

        callback(defaultAdminSettings);
        return;
      }

      const data = snapshot.data() as Partial<AdminSettingsData>;

      callback({
        ...defaultAdminSettings,
        ...data,
        compilerFeatures:
          data.compilerFeatures || defaultAdminSettings.compilerFeatures,
      });
    },
    (error) => {
      console.error("Failed to subscribe to admin settings:", error);
      callback(defaultAdminSettings);
    }
  );
}

/**
 * saveAdminSettings
 *
 * Purpose:
 * Saves admin settings to Firestore.
 */
export async function saveAdminSettings(settings: AdminSettingsData) {
  await setDoc(
    adminSettingsRef,
    {
      ...settings,
      updatedAt: serverTimestamp(),
    },
    {
      merge: true,
    }
  );
}