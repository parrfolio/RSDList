import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import * as cheerio from 'cheerio';

initializeApp();
const db = getFirestore();

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ImportRequest {
    /** URL of the RSD release list page to scrape */
    url?: string;
    /** Tab-separated release data (fallback if scraping fails) */
    pasteData?: string;
    /** Human-readable event name, e.g. "Record Store Day 2026" */
    eventName: string;
    /** Calendar year */
    year: number;
    /** spring (April) or fall (Black Friday) */
    season: 'spring' | 'fall';
    /** Release date string, e.g. "2026-04-18" */
    releaseDate: string;
}

interface ParsedRelease {
    title: string;
    artist: string;
    label: string;
    format: string;
    releaseType: string;
    quantity: number | null;
    detailsUrl: string | null;
    imageUrl: string | null;
}

// ---------------------------------------------------------------------------
// Admin check helper
// ---------------------------------------------------------------------------

async function assertAdmin(email: string | undefined): Promise<void> {
    if (!email) {
        throw new HttpsError('permission-denied', 'No email associated with account');
    }
    const adminDoc = await db.collection('admins').doc(email).get();
    if (!adminDoc.exists) {
        throw new HttpsError('permission-denied', 'You are not an admin');
    }
}

// ---------------------------------------------------------------------------
// SSRF-safe URL validation
// ---------------------------------------------------------------------------

const ALLOWED_DOMAINS = ['recordstoreday.com', 'www.recordstoreday.com'];

function validateScraperUrl(url: string): void {
    let parsed: URL;
    try {
        parsed = new URL(url);
    } catch {
        throw new HttpsError('invalid-argument', 'Invalid URL format');
    }

    // Block non-HTTP protocols
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
        throw new HttpsError('invalid-argument', 'Only HTTP/HTTPS URLs are allowed');
    }

    // Block internal/private IPs and metadata endpoints
    const hostname = parsed.hostname.toLowerCase();
    const blocked = [
        'localhost', '127.0.0.1', '0.0.0.0', '::1',
        '169.254.169.254', 'metadata.google.internal',
        '10.', '172.16.', '172.17.', '172.18.', '172.19.',
        '172.20.', '172.21.', '172.22.', '172.23.', '172.24.',
        '172.25.', '172.26.', '172.27.', '172.28.', '172.29.',
        '172.30.', '172.31.', '192.168.',
    ];
    for (const prefix of blocked) {
        if (hostname === prefix || hostname.startsWith(prefix)) {
            throw new HttpsError('invalid-argument', 'URLs targeting internal networks are not allowed');
        }
    }

    // Allowlist domains
    if (!ALLOWED_DOMAINS.includes(hostname)) {
        throw new HttpsError(
            'invalid-argument',
            `Only these domains are allowed: ${ALLOWED_DOMAINS.join(', ')}`,
        );
    }
}

// ---------------------------------------------------------------------------
// Scraper: fetch HTML and parse the table
// ---------------------------------------------------------------------------

async function scrapeReleasesFromUrl(url: string): Promise<ParsedRelease[]> {
    // Validate URL before fetching (SSRF protection)
    validateScraperUrl(url);

    const releases: ParsedRelease[] = [];

    // Fetch with browser-like headers to avoid simple WAF blocks
    const res = await fetch(url, {
        headers: {
            'User-Agent':
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            Accept:
                'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.5',
        },
    });

    if (!res.ok) {
        throw new HttpsError(
            'unavailable',
            `Failed to fetch URL: ${res.status} ${res.statusText}`,
        );
    }

    const html = await res.text();

    // Check for WAF/JS block
    if (html.includes('AwsWafIntegration') || html.includes('JavaScript is disabled')) {
        throw new HttpsError(
            'unavailable',
            'The website blocked automated access. Please use the paste data option instead.',
        );
    }

    const $ = cheerio.load(html);

    // The RSD site uses a table. Each row has cells for:
    // [image thumbnail] [title] [artist] [label] [format] [release type] [quantity]
    // Try multiple selectors to handle different table structures
    const rows = $('table tbody tr, table tr').toArray();

    for (const row of rows) {
        const cells = $(row).find('td');
        if (cells.length < 6) continue; // skip header or malformed rows

        // Determine column mapping: if first cell contains just an image, offset=1
        let offset = 0;
        const firstCellText = $(cells[0]).text().trim();
        const hasImage = $(cells[0]).find('img').length > 0;
        if (hasImage && firstCellText.length < 3) {
            offset = 1;
        }

        const title = $(cells[offset + 0]).text().trim();
        const artist = $(cells[offset + 1]).text().trim();
        const label = $(cells[offset + 2]).text().trim();
        const format = $(cells[offset + 3]).text().trim();
        const releaseType = $(cells[offset + 4]).text().trim();
        const quantityStr = $(cells[offset + 5]).text().trim().replace(/,/g, '');
        const quantity = parseInt(quantityStr, 10) || null;

        // Try to get a link to the detail page
        const link = $(cells[offset + 0]).find('a').attr('href') ??
            $(cells[offset + 1]).find('a').attr('href') ??
            $(row).find('a').first().attr('href');
        let detailsUrl: string | null = null;
        if (link) {
            detailsUrl = link.startsWith('http')
                ? link
                : `https://recordstoreday.com${link.startsWith('/') ? '' : '/'}${link}`;
        }

        // Try to get image URL
        const img = $(row).find('img').first().attr('src') ?? null;
        let imageUrl: string | null = null;
        if (img) {
            imageUrl = img.startsWith('http')
                ? img
                : `https://recordstoreday.com${img.startsWith('/') ? '' : '/'}${img}`;
        }

        if (title && artist) {
            releases.push({
                title,
                artist,
                label,
                format,
                releaseType,
                quantity,
                detailsUrl,
                imageUrl,
            });
        }
    }

    return releases;
}

// ---------------------------------------------------------------------------
// Parser: tab-separated pasted text
// ---------------------------------------------------------------------------

function parseTabSeparatedData(text: string): ParsedRelease[] {
    const releases: ParsedRelease[] = [];
    const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);

    for (const line of lines) {
        // Skip header row
        if (line.toUpperCase().startsWith('TITLE') && line.toUpperCase().includes('ARTIST')) {
            continue;
        }

        // Split by tab
        const parts = line.split('\t');
        if (parts.length < 5) continue;

        const title = parts[0]?.trim() ?? '';
        const artist = parts[1]?.trim() ?? '';
        const label = parts[2]?.trim() ?? '';
        const format = parts[3]?.trim() ?? '';
        const releaseType = parts[4]?.trim() ?? '';
        const quantityStr = (parts[5]?.trim() ?? '').replace(/,/g, '');
        const quantity = parseInt(quantityStr, 10) || null;

        if (title && artist) {
            releases.push({
                title,
                artist,
                label,
                format,
                releaseType,
                quantity,
                detailsUrl: null,
                imageUrl: null,
            });
        }
    }

    return releases;
}

// ---------------------------------------------------------------------------
// Generate a stable, URL-safe release ID
// ---------------------------------------------------------------------------

function makeReleaseId(eventId: string, artist: string, title: string, format: string): string {
    const slug = `${artist}-${title}-${format}`
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
        .slice(0, 80);
    return `${eventId}_${slug}`;
}

// ---------------------------------------------------------------------------
// Cloud Function: importRsdReleases
// ---------------------------------------------------------------------------

export const importRsdReleases = onCall(
    {
        region: 'us-central1',
        timeoutSeconds: 300,
        memory: '512MiB',
        maxInstances: 2,
    },
    async (request) => {
        // Must be authenticated
        if (!request.auth) {
            throw new HttpsError('unauthenticated', 'Must be signed in');
        }

        // Must be admin
        await assertAdmin(request.auth.token.email);

        const data = request.data as ImportRequest;

        // Validate input
        if (!data.eventName || !data.year || !data.season || !data.releaseDate) {
            throw new HttpsError(
                'invalid-argument',
                'eventName, year, season, and releaseDate are required',
            );
        }

        if (!data.url && !data.pasteData) {
            throw new HttpsError(
                'invalid-argument',
                'Either url or pasteData must be provided',
            );
        }

        const eventId = `rsd_${data.year}_${data.season}`;

        // Parse releases from URL or pasted data
        let releases: ParsedRelease[] = [];

        if (data.url) {
            try {
                releases = await scrapeReleasesFromUrl(data.url);
            } catch (err) {
                // If scraping fails and we have paste data, use that instead
                if (data.pasteData) {
                    releases = parseTabSeparatedData(data.pasteData);
                } else {
                    throw err;
                }
            }
        } else if (data.pasteData) {
            releases = parseTabSeparatedData(data.pasteData);
        }

        if (releases.length === 0) {
            throw new HttpsError('not-found', 'No releases found in the provided data');
        }

        // Write event doc
        const eventRef = db.collection('events').doc(eventId);
        await eventRef.set(
            {
                eventId,
                year: data.year,
                season: data.season,
                name: data.eventName,
                releaseDate: data.releaseDate,
                releaseCount: releases.length,
                createdAt: FieldValue.serverTimestamp(),
                updatedAt: FieldValue.serverTimestamp(),
            },
            { merge: true },
        );

        // Write releases in batches of 500 (Firestore limit)
        const BATCH_SIZE = 500;
        let written = 0;

        for (let i = 0; i < releases.length; i += BATCH_SIZE) {
            const batch = db.batch();
            const chunk = releases.slice(i, i + BATCH_SIZE);

            for (const rel of chunk) {
                const releaseId = makeReleaseId(eventId, rel.artist, rel.title, rel.format);
                const ref = db.collection('releases').doc(releaseId);

                batch.set(
                    ref,
                    {
                        releaseId,
                        eventId,
                        artist: rel.artist,
                        title: rel.title,
                        label: rel.label,
                        format: rel.format,
                        releaseType: rel.releaseType,
                        quantity: rel.quantity,
                        detailsUrl: rel.detailsUrl,
                        imageUrl: rel.imageUrl,
                        description: null,
                        createdAt: FieldValue.serverTimestamp(),
                        updatedAt: FieldValue.serverTimestamp(),
                    },
                    { merge: true },
                );
            }

            await batch.commit();
            written += chunk.length;
        }

        return {
            eventId,
            eventName: data.eventName,
            releaseCount: written,
            message: `Successfully imported ${written} releases for ${data.eventName}`,
        };
    },
);
