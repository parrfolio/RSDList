import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    collection,
    doc,
    getDocs,
    setDoc,
    deleteDoc,
    updateDoc,
    serverTimestamp,
    query,
    where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import { buildWantId, type Want, type WantStatus, type Release } from '@/types';

/** Fetch all wants for the current user, optionally filtered by event */
export function useWants(eventId?: string | null) {
    const { firebaseUser } = useAuth();
    const uid = firebaseUser?.uid;

    return useQuery<Want[]>({
        queryKey: ['wants', uid, eventId],
        enabled: !!uid,
        queryFn: async () => {
            if (!uid) return [];
            const wantsRef = collection(db, 'users', uid, 'wants');
            const q = eventId
                ? query(wantsRef, where('eventId', '==', eventId))
                : query(wantsRef);
            const snap = await getDocs(q);
            return snap.docs.map((doc) => ({ wantId: doc.id, ...doc.data() } as Want));
        },
        staleTime: 30 * 1000, // 30 seconds
    });
}

/** Add a release to the user's wants list */
export function useAddWant() {
    const { firebaseUser } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (release: Release) => {
            if (!firebaseUser) throw new Error('Not authenticated');
            const wantId = buildWantId(release.eventId, release.releaseId);
            const wantRef = doc(db, 'users', firebaseUser.uid, 'wants', wantId);
            const want: Omit<Want, 'addedAt' | 'updatedAt'> = {
                wantId,
                eventId: release.eventId,
                releaseId: release.releaseId,
                artist: release.artist,
                title: release.title,
                imageUrl: release.imageUrl ?? null,
                format: release.format ?? null,
                releaseType: release.releaseType ?? null,
                status: 'WANTED',
                acquiredAt: null,
            };
            await setDoc(wantRef, {
                ...want,
                addedAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
            return want;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['wants'] });
        },
    });
}

/** Remove a want from the user's list */
export function useRemoveWant() {
    const { firebaseUser } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (wantId: string) => {
            if (!firebaseUser) throw new Error('Not authenticated');
            const wantRef = doc(db, 'users', firebaseUser.uid, 'wants', wantId);
            await deleteDoc(wantRef);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['wants'] });
        },
    });
}

/** Toggle want status between WANTED and ACQUIRED */
export function useToggleWantStatus() {
    const { firebaseUser } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            wantId,
            newStatus,
        }: {
            wantId: string;
            newStatus: WantStatus;
        }) => {
            if (!firebaseUser) throw new Error('Not authenticated');
            const wantRef = doc(db, 'users', firebaseUser.uid, 'wants', wantId);
            await updateDoc(wantRef, {
                status: newStatus,
                acquiredAt: newStatus === 'ACQUIRED' ? serverTimestamp() : null,
                updatedAt: serverTimestamp(),
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['wants'] });
        },
    });
}
