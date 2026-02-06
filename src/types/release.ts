import { z } from 'zod/v4';
import { EventIdSchema } from './event';

export const ReleaseSchema = z.object({
  releaseId: z.string(),
  eventId: EventIdSchema,
  artist: z.string(),
  title: z.string(),
  format: z.string().nullable().optional(),
  releaseType: z.string().nullable().optional(),
  label: z.string().nullable().optional(),
  quantity: z.number().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  detailsUrl: z.string().nullable().optional(),
  createdAt: z.any().optional(),
  updatedAt: z.any().optional(),
});

export type Release = z.infer<typeof ReleaseSchema>;
