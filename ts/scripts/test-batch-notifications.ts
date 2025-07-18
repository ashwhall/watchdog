// scripts/test-batch-notifications.ts
import { DogScraper } from '../lib/scraper';
import { sendQueuedTelegramNotifications } from '../lib/scraper-utils';

async function testBatchNotifications() {
  console.log('🧪 Testing batch notification system...\n');
  
  console.log('This will run a quick scrape and send all notifications at the end with 500ms delays.\n');

  const scraper = new DogScraper({ headless: true });

  try {
    await scraper.init();

    console.log('📊 Scraping PetRescue (fastest site)...');
    const saved = await scraper.scrapePetRescue();

    console.log(`\n📈 Scraping completed!`);
    console.log(`Found ${saved} new dogs`);

    // Send all queued notifications at the end
    if (saved > 0) {
      console.log('\n📱 Sending all queued Telegram notifications with 500ms delays...');
      await sendQueuedTelegramNotifications();
      console.log('✅ All notifications sent! Check your Telegram chat.');
    } else {
      console.log('\n🔕 No new dogs found - no notifications to send');
      console.log('All dogs were already in the database.');
    }

  } catch (error) {
    console.error('❌ Error during test:', error);
  } finally {
    await scraper.close();
  }
}

testBatchNotifications().catch(console.error);
