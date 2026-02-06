import { useQuery } from '@tanstack/react-query';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
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
