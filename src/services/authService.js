import {
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut,
  setPersistence,
  browserSessionPersistence,
  onAuthStateChanged,
  GoogleAuthProvider
} from "firebase/auth";
import { getFirebaseAuth, googleProvider } from "../firebase";
import { ensureUser } from "./firestore";

// Google OAuth access token for the current session. Needed by the Picker and
// the Forms API (Firebase ID tokens cannot call Google APIs). It lives in memory
// only and expires after ~1h, at which point the user signs in again.
let googleAccessToken = null;
export const getToken = () => googleAccessToken;

export const signInWithGoogle = async () => {
  try {
    const auth = getFirebaseAuth();
    const result = await signInWithPopup(auth, googleProvider);

    const credential = GoogleAuthProvider.credentialFromResult(result);
    googleAccessToken = credential?.accessToken ?? null;

    const user = result.user;
    const profile = {
      success: true,
      uid: user.uid,
      name: user.displayName,
      email: user.email,
      photoURL: user.photoURL
    };

    // Create/refresh the user document (auto-creates the `users` collection).
    try { await ensureUser({ uid: user.uid, displayName: user.displayName, email: user.email, photoURL: user.photoURL }); }
    catch (e) { console.error("ensureUser failed:", e); }

    return profile;
  } catch (error) {
    console.error("Google Sign-In Error:", error);
    return { success: false, message: error.message };
  }
};

export const signIn = async (email, password) => {
  try {
    const auth = getFirebaseAuth();
    const result = await signInWithEmailAndPassword(auth, email, password);
    const user = result.user;
    // Email/password accounts have no Google token, so the Google form picker
    // is unavailable until they sign in with Google.
    googleAccessToken = null;
    return { success: true, uid: user.uid, name: user.displayName, email: user.email, photoURL: user.photoURL };
  } catch (error) {
    console.error("Sign-In Error:", error);
    let message = error.message;
    switch (error.code) {
      case "auth/invalid-credential":
      case "auth/wrong-password":
      case "auth/user-not-found":
        message = "Invalid email or password.";
        break;
      case "auth/invalid-email":
        message = "Invalid email address.";
        break;
      case "auth/too-many-requests":
        message = "Too many attempts. Please try again later.";
        break;
      default:
        break;
    }
    return { success: false, message };
  }
};

export const signOutUser = async () => {
  try {
    await signOut(getFirebaseAuth());
    googleAccessToken = null;
    return { success: true };
  } catch (error) {
    console.error("Sign-Out Error:", error);
    return { success: false, message: error.message };
  }
};

function withAuth(fn) {
  try { return fn(getFirebaseAuth()); }
  catch (e) { console.error("Firebase not configured:", e.message); return null; }
}

const persistence = withAuth((auth) => setPersistence(auth, browserSessionPersistence));
if (persistence && typeof persistence.catch === "function") {
  persistence.catch((error) => console.error("Persistence Error:", error));
}

export const onAuthChange = (callback) => {
  let auth;
  try { auth = getFirebaseAuth(); }
  catch { callback(null); return () => {}; }
  return onAuthStateChanged(auth, callback);
};