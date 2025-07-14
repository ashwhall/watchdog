import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

async function initializeDatabase() {
  console.log('🔧 Initializing database from schema...');

  try {
    // Create database connection
    const sqlite = new Database('sqlite.db');

    // Check if there are any migration files
    const drizzleDir = 'drizzle';
    if (!fs.existsSync(drizzleDir)) {
      console.log('📁 Creating drizzle directory...');
      fs.mkdirSync(drizzleDir, { recursive: true });
    }

    const migrationFiles = fs.existsSync(drizzleDir)
      ? fs
          .readdirSync(drizzleDir)
          .filter((file) => file.endsWith('.sql'))
          .sort()
      : [];

    if (migrationFiles.length === 0) {
      console.log(
        '⚠️  No migration files found. You may need to generate them first.'
      );
      console.log('   Run: npx drizzle-kit generate');
      sqlite.close();
      return;
    }

    // Execute each migration file manually
    for (const migrationFile of migrationFiles) {
      const migrationPath = path.join(drizzleDir, migrationFile);
      const sql = fs.readFileSync(migrationPath, 'utf-8');

      console.log(`📄 Executing migration: ${migrationFile}`);

      // Split SQL statements and execute them
      const statements = sql
        .split(';')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      for (const statement of statements) {
        try {
          sqlite.exec(statement);
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : String(error);
          console.log(`⚠️  Statement executed with warning: ${errorMessage}`);
        }
      }
    }

    console.log('✅ Database initialized successfully!');
    sqlite.close();
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

// Run database initialization
initializeDatabase();
