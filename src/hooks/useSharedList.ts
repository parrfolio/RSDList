import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp,
} from 'firebase/firestore';
import { nanoid } from 'nanoid';
import { db } from '@/lib/firebase';
import { useAuth } from '@/hooks/useAuth';
import type { ShareInfo } from '@/types';

/** Fetch share info for a given shareId */
export function useShareInfo(shareId?: string | null) {
    return useQuery<ShareInfo | null>({
        queryKey: ['shareInfo', shareId],
        enabled: !!shareId,
        queryFn: async () => {
            if (!shareId) return null;
            const snap = await getDoc(doc(db, 'shares', shareId));
            if (!snap.exists()) return null;
            return { shareId: snap.id, ...snap.data() } as ShareInfo;
        },
        staleTime: 30 * 1000,
    });
}

/** Enable sharing — creates share doc + updates user doc */
export function useEnableShare() {
    const { firebaseUser } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ ownerName, listName }: { ownerName: string; listName: string }) => {
            if (!firebaseUser) throw new Error('Not authenticated');
            const uid = firebaseUser.uid;
            const shareId = nanoid(12);

            // Create the share document
            await setDoc(doc(db, 'shares', shareId), {
                shareId,
                uid,
                ownerName,
                listName,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            // Update user doc with shareId and sharingEnabled
            await updateDoc(doc(db, 'users', uid), {
                shareId,
                sharingEnabled: true,
            });

            return shareId;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['shareInfo'] });
        },
        onError: (error) => {
            console.error('Enable sharing failed:', error);
        },
    });
}

/** Disable sharing — deletes share doc + clears user fields */
export function useDisableShare() {
    const { firebaseUser } = useAuth();
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (shareId: string) => {
            if (!firebaseUser) throw new Error('Not authenticated');
            const uid = firebaseUser.uid;

            // Delete the share document
            await deleteDoc(doc(db, 'shares', shareId));

            // Clear sharing fields on user doc
            await updateDoc(doc(db, 'users', uid), {
                shareId: null,
                sharingEnabled: false,
            });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['shareInfo'] });
        },
        onError: (error) => {
            console.error('Disable sharing failed:', error);
        },
    });
}

/** Update share info (list name, owner name) */
export function useUpdateShareInfo() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({
            shareId,
            listName,
            ownerName,
        }: {
            shareId: string;
            listName: string;
            ownerName: string;
        }) => {
            console.log('Updating share info:', { shareId, listName, ownerName });
            await updateDoc(doc(db, 'shares', shareId), {
                listName,
                ownerName,
                updatedAt: serverTimestamp(),
            });
            console.log('Share info updated successfully');
        },
        onSuccess: () => {
            console.log('Invalidating shareInfo queries');
            queryClient.invalidateQueries({ queryKey: ['shareInfo'] });
        },
        onError: (error) => {
            console.error('Update share info failed:', error);
        },
    });
}
