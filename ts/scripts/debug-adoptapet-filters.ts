#!/usr/bin/env node
// scripts/debug-adoptapet-filters.ts
import puppeteer, { Browser, Page } from 'puppeteer';

async function debugAdoptAPetFilters() {
  console.log('🔍 Opening AdoptAPet in Chrome for filter inspection...');
  console.log(
    'This will open a visible Chrome window and pause for manual inspection.'
  );
  console.log('');

  let browser: Browser | null = null;
  let page: Page | null = null;

  try {
    // Launch browser in visible mode with debugging enabled
    browser = await puppeteer.launch({
      headless: false, // Make browser visible
      devtools: true, // Open DevTools automatically
      slowMo: 50, // Slow down actions for better visibility
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-web-security',
        '--disable-features=site-per-process',
        '--disable-dev-shm-usage',
        '--start-maximized',
        '--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      ],
    });

    page = await browser.newPage();

    // Set viewport to full size
    await page.setViewport({ width: 1920, height: 1080 });

    // Enhanced headers
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'Upgrade-Insecure-Requests': '1',
      'Cache-Control': 'max-age=0',
    });

    console.log('📍 Navigating to AdoptAPet...');
    await page.goto('https://www.adoptapet.com.au/', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    // Wait for page to load
    await new Promise((resolve) => setTimeout(resolve, 3000));

    console.log('🕵️  Page loaded. Analyzing page structure...');

    // Get basic page info
    const pageInfo = await page.evaluate(() => {
      return {
        title: document.title,
        url: window.location.href,
        forms: document.querySelectorAll('form').length,
        selects: document.querySelectorAll('select').length,
        inputs: document.querySelectorAll('input').length,
        buttons: document.querySelectorAll('button').length,
        links: document.querySelectorAll('a').length,
      };
    });

    console.log('📊 Page Analysis:', pageInfo);

    // Look for filter elements
    const filterElements = await page.evaluate(() => {
      interface SelectInfo {
        id: string;
        name: string;
        className: string;
        options: { value: string; text: string | null }[];
      }

      interface FormInfo {
        id: string;
        className: string;
        action: string;
        method: string;
      }

      interface ElementInfo {
        tagName: string;
        id: string;
        name?: string;
        className: string;
        textContent?: string;
      }

      const results: {
        selects: SelectInfo[];
        forms: FormInfo[];
        searchElements: ElementInfo[];
        animalElements: ElementInfo[];
      } = {
        selects: [],
        forms: [],
        searchElements: [],
        animalElements: [],
      };

      // Look for select elements
      const selects = document.querySelectorAll('select');
      results.selects = Array.from(selects).map((select) => ({
        id: select.id,
        name: select.name,
        className: select.className,
        options: Array.from(select.options).map((option) => ({
          value: option.value,
          text: option.textContent?.trim() || null,
        })),
      }));

      // Look for form elements
      const forms = document.querySelectorAll('form');
      results.forms = Array.from(forms).map((form) => ({
        id: form.id,
        className: form.className,
        action: form.action,
        method: form.method,
      }));

      // Look for search/filter related elements
      const searchElements = document.querySelectorAll(
        '[class*="search"], [class*="filter"], [id*="search"], [id*="filter"]'
      );
      results.searchElements = Array.from(searchElements).map((el) => ({
        tagName: el.tagName,
        id: el.id,
        className: el.className,
        textContent: el.textContent?.trim().substring(0, 100),
      }));

      // Look for animal/pet type elements
      const animalElements = document.querySelectorAll(
        '[class*="animal"], [class*="pet"], [id*="animal"], [id*="pet"], [name*="animal"], [name*="pet"]'
      );
      results.animalElements = Array.from(animalElements).map((el) => ({
        tagName: el.tagName,
        id: el.id,
        name: (el as HTMLInputElement).name,
        className: el.className,
        textContent: el.textContent?.trim().substring(0, 100),
      }));

      return results;
    });

    console.log('\n🔍 Filter Elements Found:');
    console.log('Selects:', filterElements.selects.length);
    console.log('Forms:', filterElements.forms.length);
    console.log('Search Elements:', filterElements.searchElements.length);
    console.log('Animal Elements:', filterElements.animalElements.length);

    if (filterElements.selects.length > 0) {
      console.log('\n📋 Select Elements Details:');
      filterElements.selects.forEach((select, index) => {
        console.log(`  Select ${index + 1}:`);
        console.log(`    ID: ${select.id}`);
        console.log(`    Name: ${select.name}`);
        console.log(`    Class: ${select.className}`);
        console.log(`    Options (${select.options.length}):`);
        select.options.forEach((option, optIndex) => {
          if (optIndex < 10) {
            // Show first 10 options
            console.log(`      ${option.value}: ${option.text}`);
          }
        });
        if (select.options.length > 10) {
          console.log(
            `      ... and ${select.options.length - 10} more options`
          );
        }
        console.log('');
      });
    }

    if (filterElements.animalElements.length > 0) {
      console.log('\n🐕 Animal/Pet Related Elements:');
      filterElements.animalElements.forEach((el, index) => {
        console.log(`  Element ${index + 1}: ${el.tagName}`);
        console.log(`    ID: ${el.id}`);
        console.log(`    Name: ${el.name}`);
        console.log(`    Class: ${el.className}`);
        console.log(`    Text: ${el.textContent}`);
        console.log('');
      });
    }

    // Try to close any modals
    console.log('🚫 Attempting to close any modals/popups...');
    const modalSelectors = [
      '.tingle-btn--primary',
      '.modal-close',
      '.close-button',
      '[data-dismiss="modal"]',
      '.popup-close',
      'button[aria-label="Close"]',
      '.close',
      '[class*="close"]',
    ];

    for (const selector of modalSelectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          console.log(`  Found modal element: ${selector}`);
          await element.click();
          await new Promise((resolve) => setTimeout(resolve, 1000));
          console.log(`  Clicked: ${selector}`);
          break;
        }
      } catch {
        // Ignore click errors
      }
    }

    // Now try to actually set the filters
    console.log('\n🎯 Attempting to set filters for Dogs in Victoria...');

    // Try to find and select pet type (Dog)
    const petTypeSet = await page.evaluate(() => {
      // Look for select elements that might contain animal types
      const selects = document.querySelectorAll('select');

      for (const select of selects) {
        const options = Array.from(select.options);
        const dogOption = options.find(
          (option) =>
            option.textContent?.toLowerCase().includes('dog') &&
            !option.textContent?.toLowerCase().includes('cat')
        );

        if (dogOption) {
          console.log(
            `Found dog option: "${dogOption.textContent}" with value: "${dogOption.value}"`
          );
          select.value = dogOption.value;

          // Trigger change event
          const event = new Event('change', { bubbles: true });
          select.dispatchEvent(event);

          return {
            success: true,
            selectId: select.id,
            selectName: select.name,
            selectedValue: dogOption.value,
            selectedText: dogOption.textContent,
          };
        }
      }

      return { success: false, reason: 'No dog option found in any select' };
    });

    if (petTypeSet.success) {
      console.log(
        `✅ Pet type set to: ${petTypeSet.selectedText} (value: ${petTypeSet.selectedValue})`
      );
    } else {
      console.log(`❌ Could not set pet type: ${petTypeSet.reason}`);
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Try to find and select state (Victoria/VIC)
    const stateSet = await page.evaluate(() => {
      const selects = document.querySelectorAll('select');

      for (const select of selects) {
        // Check if this looks like a state selector
        const isStateSelect =
          select.name === 'state' ||
          select.id === 'state' ||
          select.className.includes('state');

        if (isStateSelect) {
          console.log(
            `Found state select: name="${select.name}", id="${select.id}"`
          );

          const options = Array.from(select.options);
          console.log(
            'State options:',
            options.map((opt) => `"${opt.textContent}" (value: ${opt.value})`)
          );

          // Look for VIC option - try multiple approaches
          let vicOption = options.find(
            (option) => option.textContent?.toLowerCase().trim() === 'vic'
          );

          // If not found, try value "3" (from your HTML example)
          if (!vicOption) {
            vicOption = options.find((option) => option.value === '3');
          }

          // If still not found, try partial matches
          if (!vicOption) {
            vicOption = options.find(
              (option) =>
                option.textContent?.toLowerCase().includes('vic') ||
                option.textContent?.toLowerCase().includes('victoria')
            );
          }

          if (vicOption) {
            console.log(
              `Found Victoria option: "${vicOption.textContent}" with value: "${vicOption.value}"`
            );
            select.value = vicOption.value;

            // Trigger multiple events to ensure it's registered
            const changeEvent = new Event('change', { bubbles: true });
            const inputEvent = new Event('input', { bubbles: true });
            select.dispatchEvent(changeEvent);
            select.dispatchEvent(inputEvent);

            return {
              success: true,
              selectId: select.id,
              selectName: select.name,
              selectedValue: vicOption.value,
              selectedText: vicOption.textContent,
            };
          } else {
            console.log('No Victoria option found in state select');
            return {
              success: false,
              reason: 'No Victoria option found in state select',
            };
          }
        }
      }

      return { success: false, reason: 'No state select found' };
    });

    if (stateSet.success) {
      console.log(
        `✅ State set to: ${stateSet.selectedText} (value: ${stateSet.selectedValue})`
      );
    } else {
      console.log(`❌ Could not set state: ${stateSet.reason}`);
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Try to find and click search/filter button
    console.log('🔍 Looking for search/submit button...');
    const searchClicked = await page.evaluate(() => {
      // Look for buttons that might trigger search
      const buttons = document.querySelectorAll(
        'button, input[type="submit"], input[type="button"]'
      );

      for (const button of buttons) {
        const text = button.textContent?.toLowerCase() || '';
        const value = (button as HTMLInputElement).value?.toLowerCase() || '';

        if (
          text.includes('search') ||
          text.includes('find') ||
          text.includes('filter') ||
          value.includes('search') ||
          value.includes('find') ||
          value.includes('filter')
        ) {
          console.log(
            `Found search button: "${
              button.textContent || (button as HTMLInputElement).value
            }"`
          );
          (button as HTMLElement).click();
          return {
            success: true,
            buttonText:
              button.textContent || (button as HTMLInputElement).value,
          };
        }
      }

      return { success: false, reason: 'No search button found' };
    });

    if (searchClicked.success) {
      console.log(`✅ Clicked search button: ${searchClicked.buttonText}`);
      await new Promise((resolve) => setTimeout(resolve, 3000)); // Wait for results to load
    } else {
      console.log(`❌ Could not find search button: ${searchClicked.reason}`);
    }

    // Get current URL to see if filters were applied
    const currentUrl = page.url();
    console.log(`📍 Current URL: ${currentUrl}`);

    console.log('\n🛑 PAUSING FOR MANUAL INSPECTION');
    console.log('=====================================');
    console.log('The browser window is now open with filters applied.');
    console.log('');
    console.log('✅ Attempted to set:');
    if (petTypeSet.success) {
      console.log(`   • Pet Type: ${petTypeSet.selectedText}`);
    }
    if (stateSet.success) {
      console.log(`   • State: ${stateSet.selectedText}`);
    }
    console.log(`   • Current URL: ${currentUrl}`);
    console.log('');
    console.log('Things to verify:');
    console.log('1. Check if the filters were applied correctly');
    console.log('2. Verify only dogs are showing (not cats)');
    console.log('3. Confirm location is set to Victoria');
    console.log('4. Note the final URL structure for scraping');
    console.log('5. Check if there are additional pages/pagination');
    console.log('');
    console.log("Press ENTER when you're done inspecting...");

    // Wait for user input
    await new Promise((resolve) => {
      process.stdin.setRawMode(true);
      process.stdin.resume();
      process.stdin.on('data', () => {
        resolve(void 0);
      });
    });
  } catch (error) {
    console.error('❌ Error during debugging:', error);
  } finally {
    if (page) {
      console.log('\n📸 Taking final screenshot...');
      try {
        await page.screenshot({
          path: 'adoptapet-debug.png',
          fullPage: true,
        });
        console.log('✅ Screenshot saved as adoptapet-debug.png');
      } catch (screenshotError) {
        console.log('⚠️  Could not save screenshot:', screenshotError);
      }
    }

    if (browser) {
      console.log('🔒 Closing browser...');
      await browser.close();
    }

    console.log('✅ Debug session completed!');
  }
}

// Run if called directly
if (require.main === module) {
  debugAdoptAPetFilters().catch(console.error);
}

export { debugAdoptAPetFilters };
