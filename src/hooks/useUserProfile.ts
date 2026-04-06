import { useEffect, useState } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase/config";
import { getUserProfile, updateEmailVerifiedStatus } from "../lib/userService";
import type { AppUser } from "../types/user";

/**
 * useUserProfile
 *
 * Purpose:
 * - Listen for the currently logged-in Firebase Auth user
 * - Load that user's Firestore profile
 * - Keep Firestore emailVerified in sync with Firebase Auth
 *
 * Why this hook exists:
 * - Firebase Auth tells us identity
 * - Firestore tells us app-specific permissions like role
 */
export const useUserProfile = () => {
  const [profile, setProfile] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        // If no user is logged in, clear the local profile state
        if (!firebaseUser) {
          setProfile(null);
          setLoading(false);
          return;
        }

        // Load the matching Firestore profile using the Firebase Auth uid
        const profileData = await getUserProfile(firebaseUser.uid);

        /**
         * If the email verification status changed in Firebase Auth,
         * update Firestore so both stay consistent.
         */
        if (
          profileData &&
          profileData.emailVerified !== firebaseUser.emailVerified
        ) {
          await updateEmailVerifiedStatus(
            firebaseUser.uid,
            firebaseUser.emailVerified
          );

          setProfile({
            ...profileData,
            emailVerified: firebaseUser.emailVerified,
          });
        } else {
          setProfile(profileData);
        }
      } catch (error) {
        console.error("Failed to load user profile:", error);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    });

    // Cleanup the auth listener when the component using this hook unmounts
    return () => unsubscribe();
  }, []);

  return { profile, loading };
};