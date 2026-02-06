import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator, enableMultiTabIndexedDbPersistence } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? 'AIzaSyBxzxMH9c6QNiPKKtc126N1ZBEoKsQV1NU',
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? 'rsdlist-e19fe.firebaseapp.com',
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? 'rsdlist-e19fe',
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? 'rsdlist-e19fe.firebasestorage.app',
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '517142871855',
    appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '1:517142871855:web:f27a2a81a88e001728ebda',
};

/** Initialized Firebase app instance */
export const app = initializeApp(firebaseConfig);

/** Firebase Auth instance */
export const auth = getAuth(app);

/** Firestore database instance */
export const db = getFirestore(app);

/** Firebase Storage instance */
export const storage = getStorage(app);

// Enable offline persistence
enableMultiTabIndexedDbPersistence(db).catch((err) => {
    if (err.code === 'failed-precondition') {
        console.warn('Firestore persistence unavailable: multiple tabs open');
    } else if (err.code === 'unimplemented') {
        console.warn('Firestore persistence not supported in this browser');
    }
});

// Connect to emulators in development
if (import.meta.env.DEV && import.meta.env.VITE_USE_EMULATORS === 'true') {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
    connectStorageEmulator(storage, '127.0.0.1', 9199);
}
