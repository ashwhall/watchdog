import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import Database from 'better-sqlite3';

async function runMigrations() {
  console.log('🚀 Running database migrations...');

  try {
    // Create database connection
    const sqlite = new Database('sqlite.db');
    const db = drizzle(sqlite);

    // Run migrations
    await migrate(db, { migrationsFolder: 'drizzle' });

    console.log('✅ Migrations completed successfully!');
    sqlite.close();
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migrations
runMigrations();
