import { useQuery } from '@tanstack/react-query';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
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
