/**
 * Maps raw Firebase (and other) error codes/messages to user-friendly strings.
 */

const FIREBASE_ERROR_MAP: Record<string, string> = {
    // Auth errors
    'auth/email-already-in-use': 'An account with this email already exists. Try signing in instead.',
    'auth/invalid-email': 'Please enter a valid email address.',
    'auth/user-disabled': 'This account has been disabled. Please contact support.',
    'auth/user-not-found': 'No account found with this email. Would you like to sign up?',
    'auth/wrong-password': 'Incorrect password. Please try again.',
    'auth/invalid-credential': 'Incorrect email or password. Please try again.',
    'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
    'auth/weak-password': 'Password is too weak. Please use at least 6 characters.',
    'auth/network-request-failed': 'Network error. Please check your connection and try again.',
    'auth/popup-closed-by-user': 'Sign-in was cancelled. Please try again.',
    'auth/popup-blocked': 'Sign-in popup was blocked. Please allow popups and try again.',
    'auth/account-exists-with-different-credential':
        'An account already exists with this email using a different sign-in method.',
    'auth/requires-recent-login': 'For security, please sign in again before making this change.',
    'auth/configuration-not-found': 'Email sign-up is not yet enabled. Please contact the admin.',
    'auth/operation-not-allowed': 'This sign-in method is not enabled. Please contact the admin.',
    'auth/expired-action-code': 'This link has expired. Please request a new one.',
    'auth/invalid-action-code': 'This link is invalid or has already been used.',

    // Firestore errors
    'permission-denied': 'You don\u2019t have permission to perform this action.',
    'not-found': 'The requested data could not be found.',
    'already-exists': 'This item already exists.',
    'resource-exhausted': 'Too many requests. Please try again in a moment.',
    'unavailable': 'Service is temporarily unavailable. Please try again later.',
    'deadline-exceeded': 'The request took too long. Please try again.',
    'unauthenticated': 'Please sign in to continue.',
    'failed-precondition': 'Unable to complete this action right now. Please try again.',
    'cancelled': 'The operation was cancelled.',

    // Storage errors
    'storage/unauthorized': 'You don\u2019t have permission to upload files.',
    'storage/canceled': 'Upload was cancelled.',
    'storage/unknown': 'An unexpected error occurred during upload. Please try again.',
    'storage/object-not-found': 'The requested file was not found.',
    'storage/quota-exceeded': 'Storage quota exceeded. Please contact support.',
    'storage/retry-limit-exceeded': 'Upload failed after multiple attempts. Please try again later.',
};

/**
 * Convert a Firebase error (or any error) into a user-friendly message.
 *
 * @param err - The caught error
 * @param fallback - A generic fallback message if no mapping is found
 */
export function friendlyError(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
    if (!err) return fallback;

    const msg = err instanceof Error ? err.message : String(err);

    // Check for Firebase error code pattern: (auth/code), (firestore/code), etc.
    const codeMatch = msg.match(/\(([^)]+)\)/);
    if (codeMatch) {
        const code = codeMatch[1];
        if (FIREBASE_ERROR_MAP[code]) {
            return FIREBASE_ERROR_MAP[code];
        }
    }

    // Check if the message directly contains a known key
    for (const [key, friendly] of Object.entries(FIREBASE_ERROR_MAP)) {
        if (msg.includes(key)) {
            return friendly;
        }
    }

    // If it still looks like a raw Firebase message, use the fallback instead
    if (msg.startsWith('Firebase:') || msg.includes('auth/') || msg.includes('firestore/')) {
        return fallback;
    }

    return fallback;
}
