import { connectDB } from '../config/db';
import { DbService } from '../services/dbService';

async function runSeed() {
  console.info('[Seed] Connecting to database...');
  await connectDB();
  console.info('[Seed] Initializing seed data...');
  await DbService.initialize();
  console.info('[Seed] Seed script finished successfully.');
  process.exit(0);
}

runSeed().catch((err) => {
  console.error('[Seed] Error during seeding:', err);
  process.exit(1);
});
