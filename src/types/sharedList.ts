import { z } from 'zod/v4';

export const ShareInfoSchema = z.object({
    shareId: z.string(),
    uid: z.string(),
    ownerName: z.string(),
    listName: z.string(),
    createdAt: z.any().optional(),
    updatedAt: z.any().optional(),
});
export type ShareInfo = z.infer<typeof ShareInfoSchema>;
