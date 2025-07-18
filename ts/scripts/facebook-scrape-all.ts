// scripts/facebook-scrape-all.ts
import { createBrowser } from '../lib/browser-utils';
import { FacebookScraper } from '../lib/facebook-scraper';
import { getFacebookCredentials } from '../lib/settings';
import { sendQueuedTelegramNotifications } from '../lib/scraper-utils';

async function facebookScrapeAll() {
  console.log('🐕 Starting comprehensive Facebook dog scraping...');

  const startTime = Date.now();

  try {
    // Check credentials
    const credentials = await getFacebookCredentials();
    if (!credentials.email || !credentials.password) {
      console.error(
        '❌ Facebook credentials not configured. Please set them in settings first.'
      );
      return 0;
    }

    // Create browser and scraper
    const browser = await createBrowser({ headless: true }); // Set to false for debugging
    const facebookScraper = new FacebookScraper(browser);

    try {
      console.log('🚀 Initializing Facebook scraper...');
      await facebookScraper.init();

      // Run the comprehensive scraping (matches Python version)
      const dogsFound = await facebookScraper.scrapeAll();

      const duration = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`🎉 Facebook scraping completed in ${duration}s`);
      console.log(`📊 Total new dogs saved: ${dogsFound}`);

      // Send all queued Telegram notifications at the end
      if (dogsFound > 0) {
        console.log('\n📱 Sending queued Telegram notifications...');
        await sendQueuedTelegramNotifications();
      }

      return dogsFound;
    } finally {
      await facebookScraper.close();
      await browser.close();
    }
  } catch (error) {
    console.error('❌ Facebook scraping failed:', error);
    return 0;
  }
}

// Run if called directly
if (require.main === module) {
  facebookScrapeAll()
    .then((count) => {
      console.log(`✨ Scraping finished. ${count} new dogs found.`);
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Fatal error:', error);
      process.exit(1);
    });
}

export { facebookScrapeAll };
