import fs from 'fs';
import path from 'path';

async function resetDatabase() {
  console.log('🗑️  Resetting database...');

  try {
    const dbPath = path.join(process.cwd(), 'sqlite.db');

    // Remove existing database file if it exists
    if (fs.existsSync(dbPath)) {
      fs.unlinkSync(dbPath);
      console.log('✓ Existing database file removed');
    }

    console.log('✅ Database reset completed!');
    console.log(
      '💡 Run "npm run db:setup" to recreate the database with migrations and seed data'
    );
  } catch (error) {
    console.error('❌ Database reset failed:', error);
    process.exit(1);
  }
}

// Run database reset
resetDatabase();
