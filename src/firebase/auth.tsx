import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "./config";

/**
 * registerUser
 *
 * Purpose:
 * Creates a Firebase Auth account using email and password,
 * then updates the user's display name.
 *
 * Important:
 * This function returns the full userCredential so the calling page
 * can decide what to do next, such as:
 * - send email verification
 * - create Firestore profile
 */
export const registerUser = async (
  username: string,
  email: string,
  password: string
) => {
  const userCredential = await createUserWithEmailAndPassword(
    auth,
    email,
    password
  );

  await updateProfile(userCredential.user, {
    displayName: username,
  });

  return userCredential;
};

/**
 * loginUser
 *
 * Purpose:
 * Signs in an existing user with email and password.
 */
export const loginUser = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

/**
 * loginWithGoogle
 *
 * Purpose:
 * Signs in the user with Google.
 * If this is their first time, create a Firestore profile document.
 */
export const loginWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;

  const userRef = doc(db, "users", user.uid);
  const existingUser = await getDoc(userRef);

  if (!existingUser.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      displayName: user.displayName || "",
      email: user.email || "",
      provider: "google",
      role: "user", // Default role for new Google users
      emailVerified: user.emailVerified,
      createdAt: serverTimestamp(),
    });
  }

  return user;
};

/**
 * logoutUser
 *
 * Purpose:
 * Signs out the current user.
 */
export const logoutUser = async () => {
  await signOut(auth);
};