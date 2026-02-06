import { z } from 'zod/v4';

export const SeasonSchema = z.enum(['spring', 'fall']);
export type Season = z.infer<typeof SeasonSchema>;

export const EventIdSchema = z.string().regex(/^rsd_\d{4}_(spring|fall)$/);
export type EventId = z.infer<typeof EventIdSchema>;

export const RsdEventSchema = z.object({
  eventId: EventIdSchema,
  year: z.number().int().min(2000).max(2100),
  season: SeasonSchema,
  name: z.string(),
  releaseDate: z.string().nullable(),
  createdAt: z.any().optional(),
  updatedAt: z.any().optional(),
});

export type RsdEvent = z.infer<typeof RsdEventSchema>;

/** Build an event ID from year and season */
export function buildEventId(year: number, season: Season): EventId {
  return `rsd_${year}_${season}`;
}

/** Parse an event ID into its parts */
export function parseEventId(eventId: EventId): { year: number; season: Season } {
  const parts = eventId.split('_');
  return {
    year: parseInt(parts[1], 10),
    season: parts[2] as Season,
  };
}

/** Get a human-readable label for an event */
export function getEventLabel(eventId: EventId): string {
  const { year, season } = parseEventId(eventId);
  return season === 'spring'
    ? `Record Store Day ${year}`
    : `RSD Black Friday ${year}`;
}
