import {
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    GoogleAuthProvider,
    FacebookAuthProvider,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    type User as FirebaseUser,
    type Unsubscribe,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { httpsCallable } from 'firebase/functions';
import { auth, db, storage, functions } from '@/lib/firebase';
import type { User } from '@/types';

const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();

export async function signInWithGoogle() {
    const result = await signInWithPopup(auth, googleProvider);
    await ensureUserDoc(result.user);
    return result.user;
}

export async function signInWithFacebook() {
    const result = await signInWithPopup(auth, facebookProvider);
    await ensureUserDoc(result.user);
    return result.user;
}

export async function signInWithEmail(email: string, password: string) {
    const result = await signInWithEmailAndPassword(auth, email, password);
    await ensureUserDoc(result.user);
    return result.user;
}

export async function signUpWithEmail(email: string, password: string) {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await ensureUserDoc(result.user);
    return result.user;
}

export async function signOut() {
    return firebaseSignOut(auth);
}

export function onAuthChange(callback: (user: FirebaseUser | null) => void): Unsubscribe {
    return onAuthStateChanged(auth, callback);
}

/** Update user profile fields in Firestore (owner-only) */
export async function updateUserProfile(uid: string, data: { displayName?: string; photoURL?: string }) {
    if (uid !== auth.currentUser?.uid) {
        throw new Error('Cannot update another user\'s profile');
    }
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, { ...data, updatedAt: serverTimestamp() });
}

/**
 * Upload an avatar image to Firebase Storage and update the user's photoURL.
 * Replaces any existing avatar for the user (only one stored at a time).
 */
export async function uploadAvatar(uid: string, file: File): Promise<string> {
    if (uid !== auth.currentUser?.uid) {
        throw new Error('Cannot upload avatar for another user');
    }

    // Always overwrite the same path so there's only one avatar per user
    const avatarRef = ref(storage, `avatars/${uid}/avatar`);

    // Delete existing avatar if present (ignore errors if none exists)
    try { await deleteObject(avatarRef); } catch { /* no existing avatar */ }

    // Upload the new file
    await uploadBytes(avatarRef, file, { contentType: file.type });
    const downloadURL = await getDownloadURL(avatarRef);

    // Persist the URL to the user's Firestore doc
    await updateUserProfile(uid, { photoURL: downloadURL });

    return downloadURL;
}

/**
 * Delete the current user's account and all associated data.
 * Calls a Cloud Function to clean up server-side data, then signs out locally.
 */
export async function deleteAccount(): Promise<void> {
    if (!auth.currentUser) {
        throw new Error('Must be signed in to delete account');
    }
    const deleteUserAccount = httpsCallable(functions, 'deleteUserAccount');
    await deleteUserAccount();
    await firebaseSignOut(auth);
}

/** Create user profile document if it doesn't exist */
async function ensureUserDoc(firebaseUser: FirebaseUser) {
    const userRef = doc(db, 'users', firebaseUser.uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
        const userData: User = {
            uid: firebaseUser.uid,
            displayName: firebaseUser.displayName ?? null,
            email: firebaseUser.email ?? null,
            photoURL: firebaseUser.photoURL ?? null,
            avatarId: 'vinyl-1',
            authProviders: firebaseUser.providerData.map((p) => p.providerId),
        };
        await setDoc(userRef, {
            ...userData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
    }
}
