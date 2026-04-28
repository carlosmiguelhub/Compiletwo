import {
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase/config";
import type { AppUser } from "../types/user";

/**
 * createUserProfile
 *
 * Purpose:
 * Creates a Firestore user document right after registration.
 *
 * Why this is needed:
 * Firebase Auth stores authentication info only.
 * Firestore stores app-specific data like role and display name.
 */
export const createUserProfile = async (
  uid: string,
  email: string,
  displayName: string
) => {
  const userRef = doc(db, "users", uid);

await setDoc(userRef, {
  uid,
  email,
  displayName,
  role: "user",
  status: "active",
  emailVerified: false,
  createdAt: serverTimestamp(),
});
};

/**
 * getUserProfile
 *
 * Purpose:
 * Fetch one Firestore user document using the Firebase Auth uid.
 */
export const getUserProfile = async (uid: string): Promise<AppUser | null> => {
  const userRef = doc(db, "users", uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    return null;
  }

  return {
    ...(snapshot.data() as AppUser),
    uid: snapshot.id,
  };
};

/**
 * getAllUsers
 *
 * Purpose:
 * Fetch all users for the admin management page.
 */
export const getAllUsers = async (): Promise<AppUser[]> => {
  const usersRef = collection(db, "users");
  const snapshot = await getDocs(usersRef);

  return snapshot.docs.map((docSnap) => ({
    ...(docSnap.data() as AppUser),
    uid: docSnap.id,
  }));
};

/**
 * updateUserRole
 *
 * Purpose:
 * Change a user's role between "user" and "admin".
 *
 * Important:
 * Firestore security rules must restrict who is allowed
 * to call this successfully.
 */

/**
 * updateUserStatus
 *
 * Purpose:
 * Enable or disable a user account from the admin panel.
 */
export const updateUserStatus = async (
  uid: string,
  status: "active" | "disabled"
) => {
  const userRef = doc(db, "users", uid);

  await updateDoc(userRef, {
    status,
  });
};

export const updateUserRole = async (
  uid: string,
  role: "user" | "admin"
) => {
  const userRef = doc(db, "users", uid);

  await updateDoc(userRef, {
    role,
  });
};

/**
 * updateEmailVerifiedStatus
 *
 * Purpose:
 * Keep Firestore emailVerified aligned with Firebase Auth.
 */
export const updateEmailVerifiedStatus = async (
  uid: string,
  emailVerified: boolean
) => {
  const userRef = doc(db, "users", uid);

  await updateDoc(userRef, {
    emailVerified,
  });
};

/**
 * subscribeAllUsers
 *
 * Purpose:
 * Realtime listener for all users.
 * Used by admin pages so user counts and tables update automatically.
 *
 * Returns:
 * The unsubscribe function from Firestore.
 */
export function subscribeAllUsers(callback: (users: AppUser[]) => void) {
  const usersRef = collection(db, "users");

  return onSnapshot(usersRef, (snapshot) => {
    const users = snapshot.docs.map((docSnap) => ({
      ...(docSnap.data() as AppUser),
      uid: docSnap.id,
    }));

    callback(users);
  });
}