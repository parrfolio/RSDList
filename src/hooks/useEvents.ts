import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    collection,
    getDocs,
    orderBy,
    query,
    doc,
    deleteDoc,
    where,
    writeBatch,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { RsdEvent } from '@/types';

/** Fetch all RSD events */
export function useEvents() {
    return useQuery<RsdEvent[]>({
        queryKey: ['events'],
        queryFn: async () => {
            const q = query(
                collection(db, 'events'),
                orderBy('year', 'desc'),
            );
            const snap = await getDocs(q);
            return snap.docs.map((doc) => ({ eventId: doc.id, ...doc.data() } as RsdEvent));
        },
        staleTime: 10 * 60 * 1000, // 10 minutes
    });
}

/** Delete an event and all its releases (admin only — Firestore rules enforce this) */
export function useDeleteEvent() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (eventId: string) => {
            // Delete all releases for this event in batches of 500
            const releasesQuery = query(
                collection(db, 'releases'),
                where('eventId', '==', eventId),
            );
            const snap = await getDocs(releasesQuery);
            const BATCH_SIZE = 500;
            for (let i = 0; i < snap.docs.length; i += BATCH_SIZE) {
                const batch = writeBatch(db);
                const chunk = snap.docs.slice(i, i + BATCH_SIZE);
                for (const d of chunk) {
                    batch.delete(d.ref);
                }
                await batch.commit();
            }

            // Delete the event doc itself
            await deleteDoc(doc(db, 'events', eventId));
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events'] });
            queryClient.invalidateQueries({ queryKey: ['releases'] });
        },
    });
}
