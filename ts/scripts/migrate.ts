import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

async function ensureJournalExists() {
  const journalPath = path.join('drizzle', 'meta', '_journal.json');
  const metaDir = path.join('drizzle', 'meta');

  // Ensure meta directory exists
  if (!fs.existsSync(metaDir)) {
    console.log('📁 Creating meta directory...');
    fs.mkdirSync(metaDir, { recursive: true });
  }

  // Check if journal file exists
  if (!fs.existsSync(journalPath)) {
    console.log('📝 Creating missing _journal.json file...');

    // Create a basic journal structure
    const journalContent = {
      version: '7',
      dialect: 'sqlite',
      entries: [] as Array<{
        idx: number;
        version: string;
        when: number;
        tag: string;
        breakpoints: boolean;
      }>,
    };

    // Check for existing migration files and add them to journal
    const drizzleDir = 'drizzle';
    if (fs.existsSync(drizzleDir)) {
      const migrationFiles = fs
        .readdirSync(drizzleDir)
        .filter((file) => file.endsWith('.sql'))
        .sort();

      migrationFiles.forEach((file, index) => {
        const tag = file.replace('.sql', '');
        journalContent.entries.push({
          idx: index,
          version: '6',
          when: Date.now() - (migrationFiles.length - index) * 1000,
          tag: tag,
          breakpoints: true,
        });
      });
    }

    fs.writeFileSync(journalPath, JSON.stringify(journalContent, null, 2));
    console.log('✅ Journal file created successfully!');
  }
}

async function runMigrations() {
  console.log('🚀 Running database migrations...');

  try {
    // Ensure journal file exists before running migrations
    await ensureJournalExists();

    // Create database connection
    const sqlite = new Database('sqlite.db');
    const db = drizzle(sqlite);

    // Run migrations
    await migrate(db, { migrationsFolder: 'drizzle' });

    console.log('✅ Migrations completed successfully!');
    sqlite.close();
  } catch (error) {
    console.error('❌ Migration failed:', error);
    console.log('🔧 Attempting to continue without exiting...');
    // Don't exit process to allow container to continue
  }
}

// Run migrations
runMigrations();
