import {
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  updateDoc,
  serverTimestamp,
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
    role: "user", // Every new account starts as a normal user
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

  return snapshot.data() as AppUser;
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

  return snapshot.docs.map((doc) => doc.data() as AppUser);
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
export const updateUserRole = async (
  uid: string,
  role: "user" | "admin"
) => {
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, { role });
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
  await updateDoc(userRef, { emailVerified });
};