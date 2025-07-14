// scripts/test-facebook-page.ts
import puppeteer from 'puppeteer';
import { FacebookScraper } from '../lib/facebook-scraper';

async function testFacebookPage() {
  console.log('🌐 Testing Facebook page scraping...');

  const browser = await puppeteer.launch({
    headless: false, // Keep visible for debugging
    devtools: true,
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
    ],
  });

  try {
    const scraper = new FacebookScraper(browser);

    // Test with a public page that should have content
    console.log('Testing with PetRescueAU page...');
    const result1 = await scraper.scrapePage('PetRescueAU');
    console.log(`PetRescueAU result: ${result1} dogs`);

    // Should reuse login
    console.log('\nTesting with RSPCA.Victoria page (should reuse login)...');
    const result2 = await scraper.scrapePage('RSPCA.Victoria');
    console.log(`RSPCA.Victoria result: ${result2} dogs`);

    console.log('\n✅ Test completed');
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await browser.close();
  }
}

testFacebookPage().catch(console.error);
