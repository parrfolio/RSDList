import { initializeApp } from 'firebase/app';
import { initializeAppCheck, ReCaptchaV3Provider, type AppCheck } from 'firebase/app-check';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import {
    initializeFirestore,
    persistentLocalCache,
    persistentMultipleTabManager,
    connectFirestoreEmulator,
} from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

if (!firebaseConfig.apiKey) {
    throw new Error('Missing Firebase configuration. Copy .env.example to .env and fill in your values.');
}

/** Initialized Firebase app instance */
export const app = initializeApp(firebaseConfig);

// Enable App Check debug token provider when running on localhost
if (import.meta.env.DEV) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = true;
}

/** Firebase App Check — initialized gracefully so a misconfigured key doesn't block the app */
export let appCheck: AppCheck | null = null;
try {
    appCheck = initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider('6LdS3WUsAAAAABv3svF1Fj7yEwcuxyBaf-b4ipJD'),
        isTokenAutoRefreshEnabled: true,
    });
} catch (e) {
    console.warn('App Check initialization failed — continuing without it:', e);
}

/** Firebase Auth instance */
export const auth = getAuth(app);

/** Firestore database instance (with persistent multi-tab cache) */
export const db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
});

/** Firebase Storage instance */
export const storage = getStorage(app);

/** Cloud Functions instance */
export const functions = getFunctions(app, 'us-central1');

// Connect to emulators in development
if (import.meta.env.DEV && import.meta.env.VITE_USE_EMULATORS === 'true') {
    connectAuthEmulator(auth, 'http://127.0.0.1:9099', { disableWarnings: true });
    connectFirestoreEmulator(db, '127.0.0.1', 8080);
    connectStorageEmulator(storage, '127.0.0.1', 9199);
    connectFunctionsEmulator(functions, '127.0.0.1', 5001);
}

// NOTE: Configure Firebase spending limits / budget alerts in the Firebase Console
// (Console → Usage & Billing → Budget Alerts) to protect against unexpected charges.
