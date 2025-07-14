#!/usr/bin/env node
// scripts/start-scheduler.ts
import { simpleScheduler } from '../lib/simple-scheduler';

async function startScheduler() {
  console.log('🕐 Starting Watchdog Simple Scheduler...');
  console.log('This will run scheduled scraping jobs in the background.');
  console.log(
    'Facebook scraping is DISABLED for scheduled runs but can be run manually.'
  );
  console.log('');

  try {
    await simpleScheduler.start();

    const status = simpleScheduler.getStatus();
    console.log('📅 Scheduler Status:');
    console.log(`  • Running: ${status.isRunning ? '✅ Yes' : '❌ No'}`);
    console.log(`  • Interval: ${status.intervalMinutes} minutes`);
    console.log(`  • Status: ${status.nextRunIn}`);

    console.log('');
    console.log('✅ Scheduler is now running!');
    console.log('💡 Press Ctrl+C to stop the scheduler');
    console.log('');

    // Keep the process alive
    process.on('SIGINT', () => {
      console.log('\n🛑 Stopping scheduler...');
      simpleScheduler.stop();
      console.log('✅ Scheduler stopped');
      process.exit(0);
    });

    // Keep the process running and check for interval updates more frequently
    setInterval(async () => {
      try {
        await simpleScheduler.updateInterval();
      } catch (error) {
        console.error('Error updating interval:', error);
      }
    }, 1 * 60 * 1000); // Check every 1 minute for faster response to setting changes

    // Keep the process alive
    const keepAlive = () => {
      setTimeout(keepAlive, 1000);
    };
    keepAlive();
  } catch (error) {
    console.error('❌ Failed to start scheduler:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  startScheduler().catch(console.error);
}

export { startScheduler };
