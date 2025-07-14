// scripts/scrape-all.ts
import puppeteer from 'puppeteer';
import { DogScraper } from '../lib/scraper';
import { FacebookScraper } from '../lib/facebook-scraper';

interface ScrapingOptions {
  facebookOnly?: boolean;
  traditionalOnly?: boolean;
}

async function scrapeAll(options: ScrapingOptions = {}) {
  console.log('🐕 Starting dog scraping from all sources...');

  if (options.facebookOnly) {
    console.log('📘 Facebook-only mode enabled');
  } else if (options.traditionalOnly) {
    console.log('📊 Traditional websites-only mode enabled');
  }

  const startTime = Date.now();

  const browser = await puppeteer.launch({
    headless: false, // Disabled for debugging
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--disable-features=VizDisplayCompositor',
      '--disable-web-security',
      '--disable-features=site-per-process',
      '--disable-dev-shm-usage',
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      '--disable-ipc-flooding-protection',
      '--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      // DNS resolution improvements
      '--dns-prefetch-disable',
      '--disable-dns-over-https',
      '--aggressive-cache-discard',
      '--disable-background-networking',
    ],
  });

  const results = {
    dogshome: 0,
    petrescue: 0,
    adoptapet: 0,
    facebook: 0,
    total: 0,
  };

  try {
    // Scrape traditional websites (unless facebook-only mode)
    if (!options.facebookOnly) {
      console.log('\n📊 Scraping traditional websites...');
      const scraper = new DogScraper({ headless: true });
      const traditionalResults = await scraper.scrapeAll();

      results.dogshome = traditionalResults.dogshome;
      results.petrescue = traditionalResults.petrescue;
      results.adoptapet = traditionalResults.adoptapet;
    } else {
      console.log('\n⏭️  Skipping traditional websites (Facebook-only mode)');
    }

    // Scrape Facebook sources (unless traditional-only mode)
    if (!options.traditionalOnly) {
      console.log('\n📘 Scraping Facebook sources...');
      const facebookScraper = new FacebookScraper(browser);
      results.facebook = await facebookScraper.scrapeAll();
    } else {
      console.log('\n⏭️  Skipping Facebook sources (Traditional-only mode)');
    }

    // Calculate total
    results.total =
      results.dogshome +
      results.petrescue +
      results.adoptapet +
      results.facebook;

    console.log('\n🎉 Scraping completed!');
    console.log(`📈 Results summary:`);
    console.log(`  • Dogshome.com: ${results.dogshome} dogs`);
    console.log(`  • PetRescue.com.au: ${results.petrescue} dogs`);
    console.log(`  • AdoptAPet.com.au: ${results.adoptapet} dogs`);
    console.log(`  • Facebook: ${results.facebook} dogs`);
    console.log(`  • Total: ${results.total} new dogs found`);
    console.log(
      `⏱️  Total time: ${((Date.now() - startTime) / 1000).toFixed(1)}s`
    );
  } catch (error) {
    console.error('❌ Error during scraping:', error);
  } finally {
    await browser.close();
  }

  return results;
}

// Run if called directly
if (require.main === module) {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const options: ScrapingOptions = {};

  if (args.includes('--facebook-only')) {
    options.facebookOnly = true;
  } else if (args.includes('--traditional-only')) {
    options.traditionalOnly = true;
  }

  // Show usage if help is requested
  if (args.includes('--help') || args.includes('-h')) {
    console.log('Usage: npm run scrape-all [options]');
    console.log('');
    console.log('Options:');
    console.log('  --facebook-only     Scrape only Facebook sources');
    console.log(
      '  --traditional-only  Scrape only traditional websites (dogshome, petrescue, adoptapet)'
    );
    console.log('  --help, -h          Show this help message');
    console.log('');
    console.log('Examples:');
    console.log('  npm run scrape-all                    # Scrape all sources');
    console.log(
      '  npm run scrape-all -- --facebook-only # Scrape only Facebook'
    );
    console.log('  npx tsx scripts/scrape-all.ts --facebook-only');
    process.exit(0);
  }

  scrapeAll(options).catch(console.error);
}

export { scrapeAll };
