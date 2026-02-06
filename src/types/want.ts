import { z } from 'zod/v4';
import { EventIdSchema } from './event';

export const WantStatusSchema = z.enum(['WANTED', 'ACQUIRED']);
export type WantStatus = z.infer<typeof WantStatusSchema>;

export const WantSchema = z.object({
  wantId: z.string(),
  eventId: EventIdSchema,
  releaseId: z.string(),
  artist: z.string(),
  title: z.string(),
  imageUrl: z.string().nullable().optional(),
  format: z.string().nullable().optional(),
  releaseType: z.string().nullable().optional(),
  status: WantStatusSchema,
  addedAt: z.any().optional(),
  acquiredAt: z.any().nullable().optional(),
  updatedAt: z.any().optional(),
});

export type Want = z.infer<typeof WantSchema>;

/** Build a wantId from eventId and releaseId */
export function buildWantId(eventId: string, releaseId: string): string {
  return `${eventId}_${releaseId}`;
}
