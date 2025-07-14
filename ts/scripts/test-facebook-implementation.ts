// scripts/test-facebook-implementation.ts
import { createBrowser } from '../lib/browser-utils';
import { FacebookScraper } from '../lib/facebook-scraper';
import { getFacebookCredentials } from '../lib/settings';

async function testFacebookImplementation() {
  console.log('🧪 Testing Facebook scraper implementation...');

  try {
    // Check if credentials are available
    const credentials = await getFacebookCredentials();
    console.log('📧 Facebook email configured:', !!credentials.email);
    console.log('🔑 Facebook password configured:', !!credentials.password);

    if (!credentials.email || !credentials.password) {
      console.log(
        '❌ Facebook credentials not configured. Please set them first.'
      );
      console.log('   You can set them via the web interface at /settings');
      return;
    }

    // Create browser and scraper
    const browser = await createBrowser({ headless: false });
    const facebookScraper = new FacebookScraper(browser);

    try {
      // Initialize the scraper
      await facebookScraper.init();
      console.log('✅ Facebook scraper initialized');

      // Test login
      console.log('🔐 Testing Facebook login...');
      const loginSuccess = await facebookScraper.login();

      if (loginSuccess) {
        console.log('✅ Login successful!');

        // Test scraping a single page (smaller test)
        console.log('📘 Testing page scraping...');
        const pageDogs = await facebookScraper.scrapePage('PetRescueAU');
        console.log(`✅ Found ${pageDogs.length} dogs from PetRescueAU page`);

        // Test scraping a single group (smaller test)
        console.log('👥 Testing group scraping...');
        const groupDogs = await facebookScraper.scrapeGroup('571800346240922');
        console.log(`✅ Found ${groupDogs.length} dogs from test group`);

        console.log('🎉 All tests passed!');
        console.log(
          `📊 Total dogs found: ${pageDogs.length + groupDogs.length}`
        );
      } else {
        console.log('❌ Login failed');
      }
    } finally {
      await facebookScraper.close();
      await browser.close();
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run if called directly
if (require.main === module) {
  testFacebookImplementation().catch(console.error);
}

export { testFacebookImplementation };
