// scripts/init-db.ts
import Database from 'better-sqlite3';

// Create database connection
const sqlite = new Database('sqlite.db');

// Run migrations
try {
  console.log('Initializing database...');

  // Create the dogs table manually since we don't have migrations set up
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS dogs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      breed TEXT NOT NULL,
      post_url TEXT NOT NULL,
      image_url TEXT NOT NULL,
      description TEXT NOT NULL,
      scraped_at INTEGER NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now')),
      updated_at INTEGER NOT NULL DEFAULT (strftime('%s', 'now'))
    );
  `);

  console.log('Database initialized successfully!');
} catch (error) {
  console.error('Error initializing database:', error);
} finally {
  sqlite.close();
}
