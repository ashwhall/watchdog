// scripts/debug-facebook-inspect.ts
import { createBrowser } from '../lib/browser-utils';
import { FacebookScraper } from '../lib/facebook-scraper';

async function debugFacebookInspect() {
  console.log('🔍 Opening Facebook for manual inspection...');

  // Create browser with headless=false so you can see and interact
  const browser = await createBrowser({
    headless: false,
    timeout: 30000,
  });

  const facebookScraper = new FacebookScraper(browser);

  try {
    // Initialize and login
    await facebookScraper.init();
    console.log('✅ Facebook scraper initialized');

    console.log('🔐 Logging in to Facebook...');
    const loginSuccess = await facebookScraper.login();

    if (!loginSuccess) {
      console.log('❌ Login failed - stopping');
      return;
    }

    console.log('✅ Successfully logged in to Facebook');

    // Get the page instance for manual navigation
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const page = (facebookScraper as any).page;

    // Take a screenshot of logged-in state
    await page.screenshot({
      path: 'facebook-logged-in-debug.png',
      fullPage: true,
    });
    console.log(
      '📸 Logged-in screenshot saved as facebook-logged-in-debug.png'
    );

    // Navigate to the first Facebook group from the list
    const firstGroupId = '571800346240922';
    const groupUrl = `https://m.facebook.com/groups/${firstGroupId}`;

    console.log(`📘 Navigating to Facebook group: ${groupUrl}`);

    try {
      await page.goto(groupUrl, {
        waitUntil: 'domcontentloaded',
        timeout: 15000,
      });

      // Wait a moment for content to load
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Take screenshot of the group page
      await page.screenshot({
        path: 'facebook-group-debug.png',
        fullPage: true,
      });
      console.log('📸 Group page screenshot saved as facebook-group-debug.png');

      console.log('✅ Successfully navigated to group page');
    } catch (navError) {
      console.log(
        '⚠️  Group navigation failed, trying alternative approach...'
      );
      console.error('Group navigation error:', navError);

      // Try navigating to Facebook home instead
      console.log('🏠 Trying to navigate to Facebook home...');
      try {
        await page.goto('https://m.facebook.com/home.php', {
          waitUntil: 'domcontentloaded',
          timeout: 15000,
        });

        await page.screenshot({
          path: 'facebook-home-debug.png',
          fullPage: true,
        });
        console.log('📸 Home page screenshot saved as facebook-home-debug.png');
        console.log('✅ Successfully navigated to Facebook home');
      } catch (homeError) {
        console.log('⚠️  Home navigation also failed, staying on current page');
        console.error('Home navigation error:', homeError);
      }
    }

    // Show current URL
    const currentUrl = page.url();
    console.log(`📍 Current page URL: ${currentUrl}`);

    // Log some useful information about the page
    const pageInfo = await page.evaluate(() => {
      return {
        title: document.title,
        url: window.location.href,
        elementCounts: {
          posts: document.querySelectorAll('[data-pagelet]').length,
          images: document.querySelectorAll('img').length,
          links: document.querySelectorAll('a').length,
          divs: document.querySelectorAll('div').length,
        },
      };
    });

    console.log('📊 Page information:');
    console.log(`  Title: ${pageInfo.title}`);
    console.log(`  URL: ${pageInfo.url}`);
    console.log(`  Elements found:`, pageInfo.elementCounts);

    console.log('\n🔍 BROWSER IS NOW READY FOR INSPECTION!');
    console.log('👀 You can now:');
    console.log('   - Use Chrome DevTools to inspect elements');
    console.log('   - Test selectors in the Console');
    console.log('   - Navigate manually to different pages');
    console.log('   - Check network requests');
    console.log("\n⌨️  Press Ctrl+C in this terminal when you're done");

    // Keep the browser alive for manual inspection
    await new Promise(() => {}); // Infinite wait
  } catch (error) {
    console.error('❌ Debug session failed:', error);
  } finally {
    // Note: We intentionally don't close the browser automatically
    // so you can continue inspecting. The user will close it manually.
    console.log('🧹 Cleaning up...');
    try {
      await facebookScraper.close();
      await browser.close();
    } catch {
      console.log(
        '⚠️  Cleanup error (this is normal if you closed the browser manually)'
      );
    }
  }
}

// Run if called directly
if (require.main === module) {
  debugFacebookInspect().catch(console.error);
}

export { debugFacebookInspect };
