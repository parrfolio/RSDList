import { z } from 'zod/v4';

export const UserSchema = z.object({
    uid: z.string(),
    displayName: z.string().nullable().optional(),
    email: z.string().nullable().optional(),
    avatarId: z.string().default('vinyl-1'),
    authProviders: z.array(z.string()).default([]),
    createdAt: z.any().optional(),
    updatedAt: z.any().optional(),
});

export type User = z.infer<typeof UserSchema>;
