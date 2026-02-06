/**
 * Seed script: loads JSON release data into Firestore.
 * Usage: npx tsx scripts/seed-releases.ts
 *
 * Requires GOOGLE_APPLICATION_CREDENTIALS or running locally with emulators.
 */

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { initializeApp, cert, type ServiceAccount } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize admin SDK
const useEmulator = process.env.FIRESTORE_EMULATOR_HOST;
if (useEmulator) {
  initializeApp({ projectId: 'rsdlist-e19fe' });
} else {
  const serviceAccount = JSON.parse(
    readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS ?? '', 'utf-8'),
  ) as ServiceAccount;
  initializeApp({ credential: cert(serviceAccount) });
}

const db = getFirestore();

async function seedFromFile(filePath: string) {
  const raw = readFileSync(filePath, 'utf-8');
  const data = JSON.parse(raw);

  const batch = db.batch();

  // Seed event
  if (data.event) {
    const eventRef = db.collection('events').doc(data.event.eventId);
    batch.set(eventRef, {
      ...data.event,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    console.log(`  Event: ${data.event.eventId}`);
  }

  // Seed releases
  if (data.releases) {
    for (const release of data.releases) {
      const ref = db.collection('releases').doc(release.releaseId);
      batch.set(ref, {
        ...release,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    console.log(`  Releases: ${data.releases.length}`);
  }

  await batch.commit();
}

async function main() {
  const dataDir = join(__dirname, '..', 'data', 'rsd');
  const files = readdirSync(dataDir).filter((f) => f.endsWith('.json'));

  console.log(`Seeding ${files.length} file(s)...`);
  for (const file of files) {
    console.log(`\nProcessing ${file}:`);
    await seedFromFile(join(dataDir, file));
  }

  console.log('\nDone!');
}

main().catch(console.error);
