// scripts/init-system.ts
import { exec } from 'child_process';
import { promisify } from 'util';
import readline from 'readline';

const execAsync = promisify(exec);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function runCommand(
  command: string,
  description: string
): Promise<boolean> {
  console.log(`⏳ ${description}...`);
  try {
    await execAsync(command);
    console.log(`✅ ${description} completed`);
    return true;
  } catch (error) {
    console.error(`❌ ${description} failed:`, error);
    return false;
  }
}

async function initSystem() {
  console.log('🚀 Watchdog System Initialization\n');
  console.log(
    'This script will set up your complete Watchdog system with database and Telegram notifications.\n'
  );

  // Database setup
  console.log('📊 Setting up database...');
  const dbSuccess = await runCommand(
    'npx tsx scripts/setup-db.ts',
    'Database setup'
  );

  if (!dbSuccess) {
    console.log(
      '❌ Database setup failed. Please fix the issues and try again.'
    );
    process.exit(1);
  }

  // Ask about Telegram setup
  const wantsTelegram = await question(
    '\n🤖 Do you want to set up Telegram notifications? (y/n): '
  );

  if (
    wantsTelegram.toLowerCase() === 'y' ||
    wantsTelegram.toLowerCase() === 'yes'
  ) {
    console.log('\n📱 Setting up Telegram notifications...');
    console.log('This will open an interactive setup wizard.');
    console.log('Please run: npm run telegram:setup');
    console.log('(The setup wizard needs to run in interactive mode)');
  } else {
    console.log(
      '⏭️  Skipping Telegram setup. You can set it up later with: npm run telegram:setup'
    );
  }

  // Completion
  console.log('\n🎉 System initialization completed!');
  console.log('\nNext steps:');
  console.log('1. Run `npm run dev` to start the web interface');
  console.log('2. Run `npm run scrape:all` to start scraping');
  console.log('3. Use `npm run telegram:demo` to test live notifications');
  console.log(
    '\nFor help, check the README.md file or run specific commands with --help'
  );

  rl.close();
}

initSystem().catch(console.error);
