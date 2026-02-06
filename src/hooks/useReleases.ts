import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    collection,
    query,
    where,
    orderBy,
    getDocs,
    doc,
    getDoc,
    deleteDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Release } from '@/types';

/** Fetch all releases for a given event */
export function useReleases(eventId: string | null) {
    return useQuery<Release[]>({
        queryKey: ['releases', eventId],
        enabled: !!eventId,
        queryFn: async () => {
            if (!eventId) return [];
            const q = query(
                collection(db, 'releases'),
                where('eventId', '==', eventId),
                orderBy('artist', 'asc'),
            );
            const snap = await getDocs(q);
            return snap.docs.map((doc) => ({ releaseId: doc.id, ...doc.data() } as Release));
        },
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

/** Fetch a single release by its document ID */
export function useRelease(releaseId: string | undefined) {
    return useQuery<Release | null>({
        queryKey: ['release', releaseId],
        enabled: !!releaseId,
        queryFn: async () => {
            if (!releaseId) return null;
            const docRef = doc(db, 'releases', releaseId);
            const snap = await getDoc(docRef);
            if (!snap.exists()) return null;
            return { releaseId: snap.id, ...snap.data() } as Release;
        },
        staleTime: 5 * 60 * 1000,
    });
}

/** Delete a release (admin only — Firestore rules enforce this) */
export function useDeleteRelease() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (releaseId: string) => {
            await deleteDoc(doc(db, 'releases', releaseId));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['releases'] });
        },
    });
}
