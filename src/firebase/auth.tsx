import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  reload,
} from "firebase/auth";
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from "firebase/firestore";
import { auth, db, googleProvider } from "./config";

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

export const loginUser = async (email: string, password: string) => {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  return userCredential.user;
};

export const loginWithGoogle = async () => {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;

  await reload(user);

  const googleProviderData = result.user.providerData.find(
    (provider) => provider.providerId === "google.com"
  );

  const googlePhoto = googleProviderData?.photoURL || user.photoURL || "";
  const googleDisplayName = googleProviderData?.displayName || user.displayName || "";

  const userRef = doc(db, "users", user.uid);
  const existingUser = await getDoc(userRef);

  if (!existingUser.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      displayName: googleDisplayName,
      email: user.email || "",
      photoURL: googlePhoto,
      provider: "google",
      role: "user",
      emailVerified: user.emailVerified,
      createdAt: serverTimestamp(),
    });
  } else {
    await updateDoc(userRef, {
      displayName: googleDisplayName,
      email: user.email || "",
      photoURL: googlePhoto,
      emailVerified: user.emailVerified,
    });
  }

  return user;
};

export const logoutUser = async () => {
  await signOut(auth);
};