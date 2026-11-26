import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Firebase is only initialised when there is real config, so the app can still
// boot (login screen, dummy data) without a filled-in .env file.
const hasConfig = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

export const isFirebaseConfigured = () => hasConfig;

let app, auth, firestore;

/** Initialises Firebase on first use. Throws a helpful error when unconfigured. */
export function ensureFirebase() {
  if (!hasConfig) {
    throw new Error("Firebase is not configured. Copy .env.example to .env and add your project keys.");
  }
  if (!app) {
    app = getApps()[0] ?? initializeApp(firebaseConfig);
    auth = getAuth(app);
    firestore = getFirestore(app);
  }
  return { app, auth, db: firestore };
}

/** Firestore handle. Call as db() so callers can import { db } and use db(). */
export const db = () => ensureFirebase().db;

/** Auth handle. Call as getFirebaseAuth() */
export const getFirebaseAuth = () => ensureFirebase().auth;

// The Google provider can be built without an app. The scopes below are what
// let the signed-in user's Drive forms be listed (Picker) and read live
// (structure + responses) from the Google Forms API.
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });
[
  "https://www.googleapis.com/auth/drive.readonly",
  "https://www.googleapis.com/auth/forms.body.readonly",
  "https://www.googleapis.com/auth/forms.responses.readonly"
].forEach((scope) => googleProvider.addScope(scope));

export default app;