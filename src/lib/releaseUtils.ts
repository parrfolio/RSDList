/**
 * Utilities for cleaning dirty release data from Firestore.
 *
 * Some releases have their full detail-page text dump stored in the title field:
 *   "Artist Title DETAILS Date: ... Format: ... MORE INFO description"
 * These functions extract the correct title, artist, and description.
 */

/**
 * Fix swapped / concatenated title and artist fields from the scraper.
 *
 * Common pattern: the scraper stores
 *   title  = "ArtistName AlbumName"  (concatenated)
 *   artist = "AlbumName"             (the album, not the artist!)
 *
 * This function detects that pattern and returns the corrected pair.
 * It also strips any "DETAILS …" suffix from dirty title dumps.
 */
export function fixTitleArtist(
    rawTitle: string,
    rawArtist: string,
): { title: string; artist: string } {
    let title = rawTitle;

    // Strip everything from "DETAILS" onward (dirty data)
    const detailsIdx = title.indexOf('DETAILS');
    if (detailsIdx !== -1) {
        title = title.substring(0, detailsIdx).trim();
    }

    const artist = rawArtist;

    // Nothing to fix when they're identical or empty
    if (!artist || title === artist) return { title, artist };

    // Pattern A: title = "RealArtist AlbumName", artist = "AlbumName"
    //   → title ends with the artist-field value
    if (title.length > artist.length && title.endsWith(artist)) {
        const realArtist = title.substring(0, title.length - artist.length).trim();
        if (realArtist) {
            return { title: artist, artist: realArtist };
        }
    }

    // Pattern B: title starts with artist name (artist field is correct)
    if (title.startsWith(artist + ' ')) {
        return { title: title.substring(artist.length).trim() || title, artist };
    }

    return { title, artist };
}

/**
 * Extract just the prose description from a raw description that may contain
 * embedded metadata or tracklist data. Returns null if no real description.
 */
export function cleanDescription(raw: string | null | undefined): string | null {
    if (!raw || !raw.trim()) return null;

    let text = raw.trim();

    // "MORE INFO" delimiter — everything after it is the real description
    const moreInfoIdx = text.indexOf('MORE INFO');
    if (moreInfoIdx !== -1) {
        text = text.substring(moreInfoIdx + 'MORE INFO'.length).trim();
        return text || null;
    }

    // Strip leading "TITLE DETAILS" prefix
    const detailsIdx = text.indexOf('DETAILS');
    if (detailsIdx !== -1 && detailsIdx < 80) {
        text = text.substring(detailsIdx + 'DETAILS'.length).trim();
    }

    // Strip leading metadata lines
    const metadataPattern =
        /^(Date:\s*[^\n]+\s*)?(Format:\s*[^\n]+\s*)?(Label:\s*[^\n]+\s*)?(Quantity:\s*[^\n]+\s*)?(Release\s*type:\s*[^\n]+\s*)?/i;
    text = text.replace(metadataPattern, '').trim();

    return text || null;
}

/**
 * Extract just the prose portion (before "Tracklist") from a description.
 */
export function getProseOnly(description: string | null): string | null {
    if (!description) return null;
    const tracklistMatch = description.match(/Track\s*list/i);
    if (tracklistMatch?.index !== undefined) {
        return description.substring(0, tracklistMatch.index).trim() || null;
    }
    return description;
}
