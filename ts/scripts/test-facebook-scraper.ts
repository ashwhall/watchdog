// scripts/test-facebook-scraper.ts
import puppeteer from 'puppeteer';
import { FacebookScraper } from '../lib/facebook-scraper';
import { areFacebookCredentialsConfigured } from '../lib/settings';

async function testFacebookScraper() {
  console.log('Testing Facebook scraper...');

  // Check if credentials are configured
  const isConfigured = await areFacebookCredentialsConfigured();
  console.log('Facebook credentials configured:', isConfigured);

  if (!isConfigured) {
    console.log(
      'Facebook credentials not configured. Please set them in the settings page first.'
    );
    return;
  }

  const browser = await puppeteer.launch({
    headless: false, // Set to true for production
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--disable-features=VizDisplayCompositor',
    ],
  });

  try {
    console.log('Creating Facebook scraper...');
    const facebookScraper = new FacebookScraper(browser);

    // Test scraping a single Facebook page
    console.log('Testing Facebook page scraping...');
    const pageResults = await facebookScraper.scrapePage('PetRescueAU');
    console.log(`Facebook page scraping result: ${pageResults} dogs saved`);

    // Test scraping a single Facebook group (if you want to test)
    console.log('Testing Facebook group scraping...');
    const groupResults = await facebookScraper.scrapeGroup('571800346240922');
    console.log(`Facebook group scraping result: ${groupResults} dogs saved`);

    // Test full scraping
    // console.log('Testing full Facebook scraping...');
    // const allResults = await facebookScraper.scrapeAll();
    // console.log(`Full Facebook scraping result: ${allResults} dogs saved`);
  } catch (error) {
    console.error('Error during Facebook scraping test:', error);
  } finally {
    await browser.close();
  }
}

// Run the test
testFacebookScraper().catch(console.error);
