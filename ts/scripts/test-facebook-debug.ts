// scripts/test-facebook-debug.ts
import { scrapeFacebookOnly } from './scrape-facebook';

async function testFacebookDebug() {
  console.log('🔍 Testing Facebook scraper with debug output...');

  try {
    console.log('\n📘 Running Facebook-only scraping...');
    const results = await scrapeFacebookOnly();
    console.log(
      `\n✅ Facebook scraping completed: ${results.facebook} dogs saved`
    );
  } catch (error) {
    console.error('❌ Error during Facebook scraping test:', error);
  }
}

// Run the test
testFacebookDebug().catch(console.error);
