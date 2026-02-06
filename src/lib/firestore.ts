import {
    collection,
    doc,
    getDoc as firestoreGetDoc,
    getDocs,
    setDoc as firestoreSetDoc,
    updateDoc as firestoreUpdateDoc,
    deleteDoc as firestoreDeleteDoc,
    query,
    type DocumentData,
    type QueryConstraint,
    type WithFieldValue,
    type UpdateData,
    type SetOptions,
    serverTimestamp,
    type CollectionReference,
    type DocumentReference,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// ---------------------------------------------------------------------------
// Collection / Document reference helpers
// ---------------------------------------------------------------------------

/** Get a typed collection reference */
export function typedCollection<T = DocumentData>(
    path: string,
    ...pathSegments: string[]
): CollectionReference<T> {
    return collection(db, path, ...pathSegments) as CollectionReference<T>;
}

/** Get a typed document reference */
export function typedDoc<T = DocumentData>(
    path: string,
    ...pathSegments: string[]
): DocumentReference<T> {
    return doc(db, path, ...pathSegments) as DocumentReference<T>;
}

// ---------------------------------------------------------------------------
// CRUD helpers
// ---------------------------------------------------------------------------

/** Fetch a single document by path. Returns `null` if not found. */
export async function getDocument<T = DocumentData>(
    path: string,
    ...pathSegments: string[]
): Promise<(T & { id: string }) | null> {
    const ref = typedDoc<T>(path, ...pathSegments);
    const snap = await firestoreGetDoc(ref);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() } as T & { id: string };
}

/** Fetch all documents in a collection, optionally with query constraints. */
export async function getCollection<T = DocumentData>(
    path: string,
    ...constraints: QueryConstraint[]
): Promise<(T & { id: string })[]> {
    const ref = typedCollection<T>(path);
    const q = constraints.length > 0 ? query(ref, ...constraints) : ref;
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as T & { id: string });
}

/**
 * Create or overwrite a document.
 * Automatically adds a `createdAt` server timestamp when merging is not used.
 */
export async function setDocument<T extends DocumentData>(
    path: string,
    data: WithFieldValue<T>,
    options?: SetOptions,
): Promise<void> {
    const ref = doc(db, path);
    const payload = {
        ...data,
        updatedAt: serverTimestamp(),
        ...(!options?.merge ? { createdAt: serverTimestamp() } : {}),
    } as WithFieldValue<T>;
    await firestoreSetDoc(ref, payload, options ?? {});
}

/** Update fields on an existing document. */
export async function updateDocument<T extends DocumentData>(
    path: string,
    data: UpdateData<T>,
): Promise<void> {
    const ref = doc(db, path);
    await firestoreUpdateDoc(ref, {
        ...data,
        updatedAt: serverTimestamp(),
    } as UpdateData<DocumentData>);
}

/** Delete a document by path. */
export async function deleteDocument(path: string): Promise<void> {
    const ref = doc(db, path);
    await firestoreDeleteDoc(ref);
}
