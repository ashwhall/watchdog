import { db } from '../lib/db';
import { settings } from '../lib/schema';

async function initializeSettings() {
  try {
    console.log('Initializing settings table...');

    // Try to create the table (this will fail if it already exists, which is fine)
    await db.run(`
      CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT NOT NULL UNIQUE,
        value TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `);

    console.log('Settings table created successfully!');

    // Insert default settings if they don't exist
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
          `Default setting '${setting.key}' = '${setting.value}' inserted`
        );
      } catch {
        // Setting already exists, which is fine
        console.log(`Setting '${setting.key}' already exists`);
      }
    }

    console.log('Settings initialization complete!');
  } catch (error) {
    console.error('Error initializing settings:', error);
  }
}

// Run the initialization
initializeSettings();
