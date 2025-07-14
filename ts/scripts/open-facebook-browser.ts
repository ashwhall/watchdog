// scripts/open-facebook-browser.ts
import { createBrowser, setupAntiDetection } from '../lib/browser-utils';

async function openFacebookBrowser() {
  console.log('🌐 Opening Chrome browser for Facebook interaction...');

  const browser = await createBrowser({ headless: false });

  try {
    const page = await browser.newPage();

    // Enhanced anti-detection measures (using shared utilities)
    await setupAntiDetection(page);
    // Override plugins array
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'plugins', {
        get: () => [1, 2, 3, 4, 5],
      });
    });

    // Override languages
    await page.evaluateOnNewDocument(() => {
      Object.defineProperty(navigator, 'languages', {
        get: () => ['en-US', 'en'],
      });
    });

    // Override permissions
    await page.evaluateOnNewDocument(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const originalQuery = (window.navigator.permissions as any).query;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window.navigator.permissions as any).query = (parameters: unknown) =>
        originalQuery
          ? originalQuery(parameters)
          : Promise.resolve({ state: 'granted' });
    });

    // Set extra headers to look more like a real browser
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'Upgrade-Insecure-Requests': '1',
      'Cache-Control': 'max-age=0',
    });

    console.log('🚀 Navigating to Facebook...');

    // Navigate to Facebook mobile (easier to inspect)
    await page.goto('https://m.facebook.com', {
      waitUntil: 'domcontentloaded',
      timeout: 15000,
    });

    console.log('✅ Browser ready! You can now:');
    console.log('   • Log in manually');
    console.log('   • Navigate to any Facebook page/group');
    console.log('   • Inspect elements using DevTools');
    console.log('   • Test scraping strategies');
    console.log('');
    console.log('📝 Common Facebook URLs to test:');
    console.log('   • https://m.facebook.com/PetRescueAU');
    console.log('   • https://m.facebook.com/groups/571800346240922');
    console.log('   • https://m.facebook.com/vicdogrescue');
    console.log('');
    console.log('🔍 To inspect images, right-click and "Inspect Element"');
    console.log(
      '💡 Press Ctrl+C in this terminal to close the browser when done'
    );

    // Keep the process alive until user interrupts
    process.on('SIGINT', async () => {
      console.log('\n👋 Closing browser...');
      await browser.close();
      process.exit(0);
    });

    // Keep running indefinitely
    await new Promise(() => {});
  } catch (error) {
    console.error('❌ Error:', error);
    await browser.close();
  }
}

// Run the script
openFacebookBrowser().catch(console.error);
