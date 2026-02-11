import { onCall, onRequest, HttpsError } from 'firebase-functions/v2/https';
import { initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
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
    description: string | null;
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
                description: null,
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
                description: null,
            });
        }
    }

    return releases;
}

// ---------------------------------------------------------------------------
// Description cleaner: strip embedded metadata from raw detail-page text
// ---------------------------------------------------------------------------

/**
 * Some descriptions contain the full detail-page text dump:
 * "Title DETAILS Date: ... Format: ... Label: ... Quantity: ... Release type: ... MORE INFO actual description"
 * This function extracts just the real description.
 */
function cleanDescription(raw: string | null | undefined): string | null {
    if (!raw || !raw.trim()) return null;

    let text = raw.trim();

    // Pattern 1: "MORE INFO" delimiter — everything after it is the real description
    const moreInfoIdx = text.indexOf('MORE INFO');
    if (moreInfoIdx !== -1) {
        text = text.substring(moreInfoIdx + 'MORE INFO'.length).trim();
    }

    // Pattern 2: Strip leading "TITLE DETAILS" prefix if still present
    const detailsIdx = text.indexOf('DETAILS');
    if (detailsIdx !== -1 && detailsIdx < 80) {
        // Check if there's a "MORE INFO" after DETAILS (shouldn't be if Pattern 1 caught it)
        text = text.substring(detailsIdx + 'DETAILS'.length).trim();
    }

    // Pattern 3: Strip leading metadata lines like "Date: ... Format: ... Label: ..."
    // These follow the pattern "Key: Value" and appear before the actual prose
    const metadataPattern = /^(Date:\s*[^\n]+\s*)?(Format:\s*[^\n]+\s*)?(Label:\s*[^\n]+\s*)?(Quantity:\s*[^\n]+\s*)?(Release\s*type:\s*[^\n]+\s*)?/i;
    text = text.replace(metadataPattern, '').trim();

    return text || null;
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
        enforceAppCheck: true,
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
                        description: cleanDescription(rel.description),
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

// ---------------------------------------------------------------------------
// Cloud Function: sharedListMeta
// Serves index.html with dynamic OG meta tags for /shared/:shareId URLs.
// Social-media crawlers see personalised titles; browsers get the SPA.
// ---------------------------------------------------------------------------

const BASE_URL = 'https://rsdlist-e19fe.web.app';

export const sharedListMeta = onRequest(
    { region: 'us-central1' },
    async (req, res) => {
        // Extract shareId from the path: /shared/<shareId>
        const segments = req.path.replace(/^\/+|\/+$/g, '').split('/');
        // Expected: ["shared", "<shareId>"] or just ["<shareId>"] depending on rewrite
        const shareId = segments[segments.length - 1];

        // Default meta values (fallback)
        let ogTitle = 'Create your RSD 2026 wants list!';
        let ogDescription =
            'Build your Record Store Day 2026 list, mark what you\'ve found, and share it with friends.';

        if (shareId && shareId !== 'shared') {
            try {
                const shareDoc = await db.collection('shares').doc(shareId).get();
                if (shareDoc.exists) {
                    const data = shareDoc.data();
                    const ownerName = data?.ownerName ?? '';
                    const listName = data?.listName ?? '';
                    if (ownerName && listName) {
                        ogTitle = `${ownerName} shared "${listName}" from RSDList.com`;
                        ogDescription = `Check out ${ownerName}'s Record Store Day wants list on RSDList.com`;
                    }
                }
            } catch (err) {
                console.error('Error fetching share doc for meta tags:', err);
                // Fall through to defaults
            }
        }

        const ogImage = `${BASE_URL}/rsdlist.png`;
        const ogUrl = `${BASE_URL}/shared/${shareId}`;

        // Fetch the SPA's index.html from Firebase Hosting.
        // Static files are served before rewrites, so /index.html returns
        // the Vite-built HTML directly (no loop).
        let html: string;
        try {
            const resp = await fetch(`${BASE_URL}/index.html`);
            if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
            html = await resp.text();
        } catch (err) {
            console.error('Failed to fetch index.html from hosting:', err);
            // Serve a self-contained fallback with dynamic meta tags
            html = buildFallbackHtml(ogTitle, ogDescription, ogUrl, ogImage);
            res.status(200).set('Content-Type', 'text/html').send(html);
            return;
        }

        // Replace static meta tags with dynamic ones
        html = html.replace(
            /<meta name="title"[^>]*>/,
            `<meta name="title" content="${escapeHtml(ogTitle)}" />`,
        );
        html = html.replace(
            /<meta name="description"[^>]*>/,
            `<meta name="description" content="${escapeHtml(ogDescription)}" />`,
        );
        html = html.replace(
            /<title>[^<]*<\/title>/,
            `<title>${escapeHtml(ogTitle)}</title>`,
        );

        // OG tags
        html = html.replace(
            /<meta property="og:url"[^>]*>/,
            `<meta property="og:url" content="${ogUrl}" />`,
        );
        html = html.replace(
            /<meta property="og:title"[^>]*>/,
            `<meta property="og:title" content="${escapeHtml(ogTitle)}" />`,
        );
        html = html.replace(
            /<meta property="og:description"[^>]*>/,
            `<meta property="og:description" content="${escapeHtml(ogDescription)}" />`,
        );

        // Twitter tags
        html = html.replace(
            /<meta property="twitter:url"[^>]*>/,
            `<meta property="twitter:url" content="${ogUrl}" />`,
        );
        html = html.replace(
            /<meta property="twitter:title"[^>]*>/,
            `<meta property="twitter:title" content="${escapeHtml(ogTitle)}" />`,
        );
        html = html.replace(
            /<meta property="twitter:description"[^>]*>/,
            `<meta property="twitter:description" content="${escapeHtml(ogDescription)}" />`,
        );

        res.status(200).set('Content-Type', 'text/html').send(html);
    },
);

function escapeHtml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function buildFallbackHtml(
    title: string,
    description: string,
    url: string,
    image: string,
): string {
    const t = escapeHtml(title);
    const d = escapeHtml(description);
    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${t}</title>
    <meta name="title" content="${t}" />
    <meta name="description" content="${d}" />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="${url}" />
    <meta property="og:title" content="${t}" />
    <meta property="og:description" content="${d}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:image:width" content="2048" />
    <meta property="og:image:height" content="1536" />
    <meta property="twitter:card" content="summary_large_image" />
    <meta property="twitter:url" content="${url}" />
    <meta property="twitter:title" content="${t}" />
    <meta property="twitter:description" content="${d}" />
    <meta property="twitter:image" content="${image}" />
  </head>
  <body>
    <div id="root"></div>
    <script>window.location.replace('${url}?nofn=1');</script>
  </body>
</html>`;
}

// ---------------------------------------------------------------------------
// Cloud Function: deleteUserAccount
// Securely deletes all user data (wants, shares, storage, profile, auth)
// ---------------------------------------------------------------------------

export const deleteUserAccount = onCall(
    {
        region: 'us-central1',
        enforceAppCheck: true,
    },
    async (request) => {
        try {
            // Must be authenticated
            if (!request.auth) {
                throw new HttpsError('unauthenticated', 'Must be signed in');
            }

            const uid = request.auth.uid;

            // 1. Delete wants subcollection in batches of 500
            const BATCH_SIZE = 500;
            const wantsRef = db.collection('users').doc(uid).collection('wants');
            const wantsSnapshot = await wantsRef.get();

            for (let i = 0; i < wantsSnapshot.docs.length; i += BATCH_SIZE) {
                const batch = db.batch();
                const chunk = wantsSnapshot.docs.slice(i, i + BATCH_SIZE);
                for (const doc of chunk) {
                    batch.delete(doc.ref);
                }
                await batch.commit();
            }

            // 2. Delete shares where uid matches
            const sharesSnapshot = await db
                .collection('shares')
                .where('uid', '==', uid)
                .get();

            for (let i = 0; i < sharesSnapshot.docs.length; i += BATCH_SIZE) {
                const batch = db.batch();
                const chunk = sharesSnapshot.docs.slice(i, i + BATCH_SIZE);
                for (const doc of chunk) {
                    batch.delete(doc.ref);
                }
                await batch.commit();
            }

            // 3. Delete storage avatars
            try {
                await getStorage()
                    .bucket()
                    .deleteFiles({ prefix: `avatars/${uid}/` });
            } catch (storageErr: unknown) {
                const code = (storageErr as { code?: number }).code;
                if (code !== 404) {
                    const errMsg = storageErr instanceof Error ? storageErr.message : String(code ?? 'unknown');
                    console.warn(`Storage avatar cleanup failed for uid ${uid}: ${errMsg}`);
                }
            }

            // 4. Delete user document
            await db.collection('users').doc(uid).delete();

            // 5. Delete auth user
            await getAuth().deleteUser(uid);

            return { success: true, message: 'Account deleted successfully' };
        } catch (err) {
            if (err instanceof HttpsError) {
                throw err;
            }
            console.error('deleteUserAccount failed:', err);
            throw new HttpsError(
                'internal',
                'Failed to delete account. Please try again.',
            );
        }
    },
);
