import { db } from '../lib/db';
import { settings } from '../lib/schema';

async function seedDatabase() {
  console.log('🌱 Seeding database with default data...');

  try {
    // Default settings to insert
    const defaultSettings = [
      { key: 'scrapeInterval', value: '60' }, // 60 minutes default
      { key: 'autoRefreshInterval', value: '30' }, // 30 seconds default
    ];

    for (const setting of defaultSettings) {
      try {
        await db.insert(settings).values({
          key: setting.key,
          value: setting.value,
        });
        console.log(
          `✓ Default setting '${setting.key}' = '${setting.value}' inserted`
        );
      } catch {
        // Setting already exists, which is fine
        console.log(`ℹ Setting '${setting.key}' already exists, skipping`);
      }
    }

    console.log('✅ Database seeding completed!');
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
}

// Run seeding
seedDatabase();
