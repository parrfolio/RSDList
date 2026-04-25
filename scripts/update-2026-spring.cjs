/**
 * One-time migration: update RSD 2026 Spring releases
 * - Mark 6 genuinely cancelled releases with cancelled: true
 * - Update 7 title-changed releases (keep same doc, update title fields)
 * - Fix 1 broken parse (Captain Beefheart)
 * - Add 4 genuinely new releases
 * 
 * SAFE: Does not delete any documents. Does not modify wants subcollections.
 * 
 * Usage: cd functions && NODE_PATH=./node_modules node ../scripts/update-2026-spring.js
 */

const { initializeApp, applicationDefault } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

initializeApp({ credential: applicationDefault(), projectId: 'rsdlist-e19fe' });
const db = getFirestore();

async function main() {
  const batch = db.batch();
  let opCount = 0;

  // ── 1. Mark genuinely cancelled releases ──────────────────────────
  const cancelledDocIds = [
    'rsd_2026_spring_cassette-box-the-chameleons-cassette-box-details-date-4-18-2026-format-cassette-',
    'rsd_2026_spring_jubilee-25th-anniversary-edition-sex-pistols-jubilee-25th-anniversary-edition-de',
    'rsd_2026_spring_knock-me-down-dropkick-murphys-the-outlets-knock-me-down-details-date-4-18-2026-',
    'rsd_2026_spring_live-at-the-moscow-music-peace-festival-skid-row-live-at-the-moscow-music-peace-',
    'rsd_2026_spring_pearl-jam-react-respond-dark-matter-tour-photographed-by-geoff-whitman-with-excl',
    'rsd_2026_spring_rock-n-groove-bunny-wailer-rock-n-groove-details-date-4-18-2026-format-lp-label-',
  ];

  // Need to find exact doc IDs by prefix since they may be truncated
  const allDocs = await db.collection('releases').where('eventId', '==', 'rsd_2026_spring').get();
  const docMap = new Map();
  allDocs.forEach(doc => docMap.set(doc.id, doc.ref));

  for (const prefix of cancelledDocIds) {
    // Find exact match or prefix match
    let ref = docMap.get(prefix);
    if (!ref) {
      for (const [id, r] of docMap) {
        if (id.startsWith(prefix)) {
          ref = r;
          break;
        }
      }
    }
    if (ref) {
      batch.update(ref, { cancelled: true, updatedAt: FieldValue.serverTimestamp() });
      opCount++;
      console.log('CANCEL:', ref.id.substring(0, 60));
    } else {
      console.log('CANCEL NOT FOUND:', prefix.substring(0, 60));
    }
  }

  // ── 2. Update title-changed releases ──────────────────────────────
  // These same-artist releases had their title changed on the website.
  // We update the existing doc so all user wants (keyed by releaseId) are preserved.
  const titleUpdates = [
    {
      prefix: 'rsd_2026_spring_tbd-title-rsd-2026-exclusive-7-all-time-low',
      newTitle: "Fool's Gold (RSD 2026 Exclusive 7\")",
    },
    {
      prefix: 'rsd_2026_spring_new-song-lucy-dacus',
      newTitle: 'Planting Tomatoes',
    },
    {
      prefix: 'rsd_2026_spring_figuring-this-out-deb-never',
      newTitle: 'Hellooo / Radio Alice',
    },
    {
      prefix: 'rsd_2026_spring_the-last-mardi-gras-professor-longhair',
      newTitle: 'Mardi Gras in Baton Rouge',
    },
    {
      prefix: 'rsd_2026_spring_what-it-sounds-like-ruel',
      newTitle: 'Hate Myself',
    },
    {
      prefix: 'rsd_2026_spring_st-germain-remixes-st-germain',
      newTitle: 'St Germain (10th Anniversary African Project Remixes)',
    },
    {
      prefix: 'rsd_2026_spring_the-live-album-neil-young',
      newTitle: 'As Time Explodes',
    },
  ];

  for (const upd of titleUpdates) {
    let ref;
    for (const [id, r] of docMap) {
      if (id.startsWith(upd.prefix)) {
        ref = r;
        break;
      }
    }
    if (ref) {
      const snap = await ref.get();
      const data = snap.data();
      const titleField = data.title || '';
      
      // Title field format: "Artist\n            OldTitle\n            DETAILS..."
      // Find the old title (second non-empty trimmed line) and replace it
      const lines = titleField.split('\n');
      const nonEmptyLines = lines.map((l, i) => ({ text: l.trim(), idx: i })).filter(l => l.text);
      
      if (nonEmptyLines.length >= 2) {
        const oldTitleLine = nonEmptyLines[1].text;
        const lineIdx = nonEmptyLines[1].idx;
        // Replace that specific line, preserving leading whitespace
        const leadingWs = lines[lineIdx].match(/^(\s*)/)?.[1] ?? '';
        lines[lineIdx] = leadingWs + upd.newTitle;
        const newTitleField = lines.join('\n');
        
        // Also update the artist field (which holds the old title due to swap)
        batch.update(ref, {
          title: newTitleField,
          artist: upd.newTitle,
          updatedAt: FieldValue.serverTimestamp(),
        });
        opCount++;
        console.log('UPDATE TITLE:', oldTitleLine, '→', upd.newTitle, '(' + ref.id.substring(0, 50) + ')');
      } else {
        console.log('UPDATE PARSE FAIL:', ref.id, '- unexpected title format');
      }
    } else {
      console.log('UPDATE NOT FOUND:', upd.prefix);
    }
  }

  // ── 3. Fix Captain Beefheart broken parse ─────────────────────────
  for (const [id, ref] of docMap) {
    if (id.includes('captain-beefheart')) {
      const snap = await ref.get();
      const data = snap.data();
      const titleField = data.title || '';
      
      // Title field: "Captain Beefheart & \nThe Magic Band\n            Lick My Decals Off, Baby..."
      // Artist was parsed as the title: "Lick My Decals Off, Baby (Deluxe Edition)"
      // Fix: merge "Captain Beefheart &" and "The Magic Band" into one line
      const fixed = titleField.replace(
        /Captain Beefheart &\s*\n\s*The Magic Band/,
        'Captain Beefheart & The Magic Band'
      );
      if (fixed !== titleField) {
        batch.update(ref, { title: fixed, updatedAt: FieldValue.serverTimestamp() });
        opCount++;
        console.log('FIX PARSE: Captain Beefheart & The Magic Band');
      } else {
        console.log('BEEFHEART: title field did not match expected pattern, skipping');
        console.log('  First 200 chars:', titleField.substring(0, 200));
      }
      break;
    }
  }

  // ── 4. Add genuinely new releases ─────────────────────────────────
  const newReleases = [
    {
      releaseId: 'rsd_2026_spring_castaways-johnny-blue-skies',
      artist: 'Johnny Blue Skies & the Dark Clouds',
      title: 'Castaways',
      format: '7" Picture Disc',
      releaseType: 'RSD Exclusive',
      label: 'Atlantic',
      quantity: 3000,
    },
    {
      releaseId: 'rsd_2026_spring_a-matter-of-time-laufey',
      artist: 'Laufey',
      title: "A Matter of Time: Live at Madison Square Garden",
      format: '2 x LP',
      releaseType: "'RSD First'",
      label: 'AWAL/Vingolf Recordings',
      quantity: 17000,
    },
    {
      releaseId: 'rsd_2026_spring_starcrawler-sings-elvis-presley',
      artist: 'Starcrawler',
      title: 'Starcrawler Sings Elvis Presley',
      format: '7" Vinyl',
      releaseType: 'RSD Exclusive',
      label: 'Starcrawler Music',
      quantity: 500,
    },
    {
      releaseId: 'rsd_2026_spring_elizabeth-taylor-taylor-swift',
      artist: 'Taylor Swift',
      title: 'Elizabeth Taylor 7" Vinyl Single',
      format: '7" Vinyl',
      releaseType: 'RSD Exclusive',
      label: 'Taylor Swift/Republic Records',
      quantity: null,
    },
  ];

  for (const rel of newReleases) {
    const ref = db.collection('releases').doc(rel.releaseId);
    batch.set(ref, {
      ...rel,
      eventId: 'rsd_2026_spring',
      description: null,
      imageUrl: null,
      detailsUrl: null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
    opCount++;
    console.log('ADD NEW:', rel.artist, '-', rel.title);
  }

  // ── 5. Update event release count ─────────────────────────────────
  const eventRef = db.collection('events').doc('rsd_2026_spring');
  // 360 existing + 4 new = 364 total (we don't delete cancelled ones)
  batch.update(eventRef, { 
    releaseCount: 364,
    updatedAt: FieldValue.serverTimestamp()
  });
  opCount++;

  console.log('\nTotal operations:', opCount);
  console.log('Committing batch...');
  await batch.commit();
  console.log('Done! All changes committed successfully.');
}

main().catch(e => {
  console.error('FAILED:', e.message);
  process.exit(1);
});
