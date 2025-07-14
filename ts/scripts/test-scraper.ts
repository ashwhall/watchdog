// scripts/test-scraper.ts
import { DogScraper } from '../lib/scraper';

async function testScraper() {
  console.log('Testing modern TypeScript scraper...');

  const scraper = new DogScraper({ headless: true });

  try {
    await scraper.init();

    // Test generic scraping first
    console.log('\n--- Testing generic scraping ---');
    const genericResults = await scraper.scrapeGeneric(
      'https://dogshome.com/dog-adoption/adopt-a-dog/?sex=&breed1=&age=&animalid=&Submit=Submit&resulttype=1'
    );
    console.log(`Generic scraper found ${genericResults.length} dogs`);

    if (genericResults.length > 0) {
      console.log('Sample result:', genericResults[0]);
    }

    // Test specific scrapers
    console.log('\n--- Testing specific scrapers ---');
    const results = await scraper.scrapeAll();

    console.log('\nScraping results:');
    Object.entries(results).forEach(([site, count]) => {
      console.log(`${site}: ${count} dogs`);
    });

    const total = Object.values(results).reduce((sum, count) => sum + count, 0);
    console.log(`\nTotal: ${total} dogs scraped`);
    console.log('✅ Test completed successfully!');
  } catch (error) {
    console.error('❌ Scraping test failed:', error);
  } finally {
    await scraper.close();
    console.log('🔒 Browser closed, exiting...');
  }
}

testScraper()
  .then(() => {
    console.log('🎉 Script finished!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });
