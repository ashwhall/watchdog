// scripts/test-facebook-login-simple.ts
import { createBrowser } from '../lib/browser-utils';
import { FacebookScraper } from '../lib/facebook-scraper';

async function testFacebookLoginSimple() {
  console.log('🧪 Testing Facebook login only...');

  const browser = await createBrowser({ headless: false });
  const facebookScraper = new FacebookScraper(browser);

  try {
    await facebookScraper.init();
    console.log('✅ Facebook scraper initialized');

    const loginSuccess = await facebookScraper.login();
    if (loginSuccess) {
      console.log('✅ Login successful!');

      // Take a screenshot to see the logged-in state
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const page = (facebookScraper as any).page;
      await page.screenshot({ path: 'facebook-logged-in.png', fullPage: true });
      console.log('📸 Screenshot saved as facebook-logged-in.png');

      // Try navigating to the basic mobile Facebook homepage
      console.log('🏠 Testing navigation to Facebook home...');
      await page.goto('https://m.facebook.com/home.php', {
        waitUntil: 'domcontentloaded',
        timeout: 10000,
      });

      await page.screenshot({ path: 'facebook-home.png', fullPage: true });
      console.log('📸 Home screenshot saved as facebook-home.png');

      console.log('🎉 Login and navigation test passed!');
    } else {
      console.log('❌ Login failed');
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await facebookScraper.close();
    await browser.close();
  }
}

// Run if called directly
if (require.main === module) {
  testFacebookLoginSimple().catch(console.error);
}

export { testFacebookLoginSimple };
