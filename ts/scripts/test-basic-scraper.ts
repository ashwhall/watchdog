// scripts/test-basic-scraper.ts
import { DogScraper } from '../lib/scraper';

async function testBasicScraper() {
  console.log('Testing basic scrapers (skipping problematic sites)...');

  const scraper = new DogScraper({ headless: true });

  try {
    await scraper.init();

    // Test only the reliable scrapers
    console.log('\n--- Testing DogHome ---');
    const doghomeCount = await scraper.scrapeDogshome();

    console.log('\n--- Testing PetRescue ---');
    const petrescueCount = await scraper.scrapePetRescue();

    const total = doghomeCount + petrescueCount;
    console.log(`\n📊 Results:`);
    console.log(`  - DogHome: ${doghomeCount} dogs`);
    console.log(`  - PetRescue: ${petrescueCount} dogs`);
    console.log(`  - Total: ${total} dogs scraped`);
    console.log('✅ Basic test completed successfully!');
  } catch (error) {
    console.error('❌ Basic scraping test failed:', error);
  } finally {
    await scraper.close();
    console.log('🔒 Browser closed, exiting...');
  }
}

testBasicScraper()
  .then(() => {
    console.log('🎉 Basic test script finished!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Basic test script failed:', error);
    process.exit(1);
  });
