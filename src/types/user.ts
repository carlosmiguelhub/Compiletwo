/**
 * AppUser
 * This is the shape of a user profile stored in Firestore.
 * We separate this from Firebase Auth because Auth only handles login identity,
 * while Firestore stores app-specific data like role and profile info.
 */
export interface AppUser {
  uid: string;
  email: string;
  displayName: string;
  role: "user" | "admin";
  emailVerified: boolean;
  createdAt?: any;
}