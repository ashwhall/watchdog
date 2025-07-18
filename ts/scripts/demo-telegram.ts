// scripts/demo-telegram.ts
import { DogScraper } from '../lib/scraper';
import { telegramNotifier } from '../lib/telegram-notifier';
import { sendQueuedTelegramNotifications } from '../lib/scraper-utils';

async function demoTelegramNotifications() {
  console.log('🐕 Telegram Notification Demo\n');

  // Initialize telegram notifier
  console.log('⏳ Initializing Telegram notifier...');
  const initialized = await telegramNotifier.init();

  if (!initialized) {
    console.log('❌ Telegram not configured. Run: npm run telegram:setup');
    process.exit(1);
  }

  console.log('✅ Telegram notifier ready');

  // Run a quick scrape to potentially find new dogs
  console.log('\n⏳ Running a quick scrape to find new dogs...');
  console.log(
    'This will scrape PetRescue (fast site) and send notifications for any new dogs found.\n'
  );

  const scraper = new DogScraper({ headless: true });

  try {
    await scraper.init();

    const saved = await scraper.scrapePetRescue();

    console.log(`\n🎉 Demo completed!`);
    console.log(`Found ${saved} new dogs`);

    // Send queued notifications at the end
    if (saved > 0) {
      console.log('\n📱 Sending queued Telegram notifications...');
      await sendQueuedTelegramNotifications();
      console.log('Check your Telegram chat for notifications! 📱');
    } else {
      console.log(
        'No new dogs found this time. All dogs were already in the database.'
      );
      console.log(
        'You can run `npm run telegram:test` to see test notifications.'
      );
    }
  } catch (error) {
    console.error('❌ Error during demo:', error);
  } finally {
    await scraper.close();
  }
}

demoTelegramNotifications().catch(console.error);
