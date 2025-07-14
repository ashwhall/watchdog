// scripts/test-facebook-simple.ts
import puppeteer from 'puppeteer';
import { FacebookScraper } from '../lib/facebook-scraper';
import { areFacebookCredentialsConfigured } from '../lib/settings';

async function testFacebookSimple() {
  console.log('🔍 Testing Facebook scraper (simple test)...');

  // Check if credentials are configured
  const isConfigured = await areFacebookCredentialsConfigured();
  if (!isConfigured) {
    console.log(
      '❌ Facebook credentials not configured. Please set them in the settings page first.'
    );
    return;
  }

  const browser = await puppeteer.launch({
    headless: false, // Keep visible for debugging
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
    ],
  });

  try {
    console.log('📘 Creating Facebook scraper...');
    const facebookScraper = new FacebookScraper(browser);

    // Test just one page first
    console.log('\n🧪 Testing single page: PetRescueAU');
    const results = await facebookScraper.scrapePage('PetRescueAU');
    console.log(`\n✅ Results: ${results} dogs saved`);

    console.log('\n⏳ Keeping browser open for 10 seconds for inspection...');
    await new Promise((resolve) => setTimeout(resolve, 10000));
  } catch (error) {
    console.error('❌ Error during test:', error);
  } finally {
    await browser.close();
  }
}

// Run the test
testFacebookSimple().catch(console.error);
