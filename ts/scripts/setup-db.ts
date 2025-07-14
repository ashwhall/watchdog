import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import Database from 'better-sqlite3';
import { db } from '../lib/db';
import { settings } from '../lib/schema';

async function setupDatabase() {
  console.log('🎯 Setting up database...');

  try {
    // Step 1: Run migrations
    console.log('📦 Running migrations...');
    const sqlite = new Database('sqlite.db');
    const migrationDb = drizzle(sqlite);
    await migrate(migrationDb, { migrationsFolder: 'drizzle' });
    console.log('✅ Migrations completed');
    sqlite.close();

    // Step 2: Seed default data
    console.log('🌱 Seeding default data...');
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
        console.log(`ℹ Setting '${setting.key}' already exists, skipping`);
      }
    }

    console.log('🎉 Database setup completed successfully!');
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

// Run database setup
setupDatabase();
