'use server';

import { auth } from '@/lib/firebase';
import { 
    signInWithPopup, 
    GoogleAuthProvider, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword,
    signOut as firebaseSignOut
} from 'firebase/auth';

export async function signInWithGoogle() {
  const provider = new GoogleAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    return JSON.parse(JSON.stringify(result.user));
  } catch (error) {
    console.error('Google sign-in error:', error);
    throw error;
  }
}

export async function signInWithEmail(email: string, password: string): Promise<any> {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        return JSON.parse(JSON.stringify(userCredential.user));
    } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
            return signUpWithEmail(email, password);
        }
        console.error('Email sign-in error', error);
        throw new Error(getFriendlyErrorMessage(error.code));
    }
}

async function signUpWithEmail(email: string, password: string): Promise<any> {
    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        return JSON.parse(JSON.stringify(userCredential.user));
    } catch (error: any) {
        console.error('Email sign-up error', error);
        throw new Error(getFriendlyErrorMessage(error.code));
    }
}


export async function signOut() {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error('Sign-out error:', error);
    throw error;
  }
}


function getFriendlyErrorMessage(errorCode: string): string {
    switch (errorCode) {
      case 'auth/invalid-email':
        return 'The email address is not valid.';
      case 'auth/user-disabled':
        return 'This user account has been disabled.';
      case 'auth/user-not-found':
        return 'No user found with this email. A new account will be created.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/email-already-in-use':
        return 'An account already exists with this email address.';
      case 'auth/operation-not-allowed':
        return 'Email/password accounts are not enabled.';
      case 'auth/weak-password':
        return 'The password is too weak. Please use a stronger password.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  }