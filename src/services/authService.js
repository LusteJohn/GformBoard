
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  signOut
} from "firebase/auth";
import { auth, googleProvider } from "../firebase";

export const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(
      auth,
      googleProvider
    );

    const user = result.user;

    return {
      success: true,
      uid: user.uid,
      name: user.displayName,
      email: user.email,
      photoURL: user.photoURL
    };

  } catch (error) {
    console.error("Google Sign-In Error:", error);

    return {
      success: false,
      message: error.message
    };
  }
};

export const signIn = async (email, password) => {
  try {
    const result = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );

    const user = result.user;

    return {
      success: true,
      uid: user.uid,
      name: user.displayName,
      email: user.email,
      photoURL: user.photoURL
    };

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

    return {
      success: false,
      message
    };
  }
};

export const signOutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error("Sign-Out Error:", error);
    return {
      success: false,
      message: error.message
    };
  }
};
