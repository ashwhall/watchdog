#!/usr/bin/env node
// scripts/reset-dogs.ts
import { db } from '../lib/db';
import { dogs } from '../lib/schema';

async function resetDogs() {
  console.log('🐕 Resetting dogs in database...');
  console.log('📝 Settings (Facebook, Telegram, etc.) will be preserved');

  try {
    // Get count before deletion
    const dogsBefore = await db.select().from(dogs);
    const countBefore = dogsBefore.length;

    // Delete all dogs
    await db.delete(dogs);

    console.log(`✅ Successfully removed ${countBefore} dogs from database`);
    console.log(
      '💾 All settings preserved (Facebook, Telegram, scheduler interval)'
    );
    console.log('');
    console.log('🚀 Ready to scrape fresh data!');
    console.log('💡 Run "npm run scrape" to populate with new dogs');
  } catch (error) {
    console.error('❌ Failed to reset dogs:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  resetDogs()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { resetDogs };
