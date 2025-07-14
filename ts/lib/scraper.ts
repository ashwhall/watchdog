// lib/scraper.ts
import puppeteer, { Browser, Page } from 'puppeteer';
import * as cheerio from 'cheerio';
import axios from 'axios';
import { ScrapedDog, saveDogs } from './scraper-utils';

export interface ScraperConfig {
  headless?: boolean;
  timeout?: number;
  maxRetries?: number;
}

export class DogScraper {
  private browser: Browser | null = null;
  private config: ScraperConfig;

  constructor(config: ScraperConfig = {}) {
    this.config = {
      headless: true,
      timeout: 10000,
      maxRetries: 3,
      ...config,
    };
  }

  async init(): Promise<void> {
    // Get Chrome executable path from environment or try to find it
    const executablePath =
      process.env.PUPPETEER_EXECUTABLE_PATH || process.env.CHROME_BIN;

    console.log('🚀 Launching browser with config:', {
      headless: this.config.headless,
      executablePath: executablePath || 'default',
    });

    const launchOptions = {
      headless: this.config.headless,
      timeout: 60000, // Increase timeout to 60 seconds
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
        '--disable-gpu',
        '--remote-debugging-port=9222',
        '--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      ],
      ...(executablePath && { executablePath }),
    };

    try {
      this.browser = await puppeteer.launch(launchOptions);
      console.log('✅ Browser launched successfully');
    } catch (error) {
      console.error('❌ Browser launch failed:', error);

      // Try fallback options
      console.log('🔄 Trying fallback browser configuration...');
      const fallbackOptions = {
        ...launchOptions,
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--remote-debugging-port=9222',
        ],
      };

      try {
        this.browser = await puppeteer.launch(fallbackOptions);
        console.log('✅ Browser launched with fallback configuration');
      } catch (fallbackError) {
        console.error('❌ Fallback browser launch also failed:', fallbackError);
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        throw new Error(`Failed to launch browser: ${errorMessage}`);
      }
    }
  }

  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }

  private async createPage(): Promise<Page> {
    if (!this.browser) {
      throw new Error('Browser not initialized. Call init() first.');
    }

    const page = await this.browser.newPage();

    // Enhanced anti-detection measures
    await page.setUserAgent(
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    );

    // Set viewport to common desktop size
    await page.setViewport({ width: 1366, height: 768 });

    // Set extra headers to look more like a real browser
    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'Upgrade-Insecure-Requests': '1',
      'Cache-Control': 'max-age=0',
    });

    return page;
  }

  private async waitForSelector(
    page: Page,
    selector: string,
    timeout = 5000
  ): Promise<boolean> {
    try {
      await page.waitForSelector(selector, { timeout });
      return true;
    } catch {
      return false;
    }
  }

  private async tryClick(page: Page, selector: string): Promise<boolean> {
    try {
      await page.click(selector);
      return true;
    } catch {
      return false;
    }
  }

  private normalizeUrl(url: string, baseUrl: string): string {
    if (url.startsWith('http')) return url;

    const base = new URL(baseUrl);
    if (url.startsWith('//')) return `${base.protocol}${url}`;
    if (url.startsWith('/')) return `${base.protocol}//${base.host}${url}`;

    return url;
  }

  async scrapeGeneric(url: string): Promise<ScrapedDog[]> {
    console.log(`Scraping ${url}...`);
    const results: ScrapedDog[] = [];

    try {
      const response = await axios.get(url, {
        timeout: this.config.timeout,
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        },
      });

      const $ = cheerio.load(response.data);

      $('img').each((_, element) => {
        const img = $(element);
        const src = img.attr('src') || img.attr('data-src');

        if (!src) return;

        const normalizedSrc = this.normalizeUrl(src, url);
        const filename = normalizedSrc.split('/').pop()?.split('?')[0] || '';

        // More lenient image filtering - include any reasonable image format
        if (!filename.match(/\.(jpg|jpeg|png|webp|gif)$/i)) return;

        // Find the parent link
        let link = img.closest('a');
        if (!link.length) {
          link = img.parent().closest('a');
        }

        const href = link.attr('href');
        if (href) {
          const normalizedHref = this.normalizeUrl(href, url);
          const alt = img.attr('alt') || '';

          // More inclusive filtering - look for dog/pet related content or adoption links
          const isDogRelated =
            alt.toLowerCase().includes('dog') ||
            alt.toLowerCase().includes('pet') ||
            alt.toLowerCase().includes('adopt') ||
            alt.toLowerCase().includes('puppy') ||
            normalizedHref.includes('dog') ||
            normalizedHref.includes('pet') ||
            normalizedHref.includes('adopt') ||
            normalizedHref.includes('animal') ||
            normalizedHref.includes('profile');

          if (isDogRelated) {
            results.push({
              postUrl: normalizedHref,
              imageUrl: normalizedSrc,
              name: alt || 'Unknown Dog',
              description: link.attr('title') || img.attr('title') || '',
            });
          }
        }
      });
    } catch (error) {
      console.error(`Error scraping ${url}:`, error);
    }

    console.log(`  → Found ${results.length} dog listings`);
    return results;
  }

  // Specific scrapers for each site
  async scrapeDogshome(): Promise<number> {
    console.log('Scraping dogshome.com...');
    const startTime = Date.now();
    let totalSaved = 0;

    const page = await this.createPage();

    try {
      // Start with the first page
      await page.goto(
        'https://dogshome.com/dog-adoption/adopt-a-dog/?sex=&breed1=&age=&animalid=&Submit=Submit&resulttype=1',
        {
          waitUntil: 'domcontentloaded',
          timeout: 15000,
        }
      );

      let pageCount = 0;
      const maxPages = 20; // Safety limit
      const allDogs: {
        postUrl: string;
        imageUrl: string;
        name: string;
        breed?: string;
      }[] = [];

      // Keep clicking "Next" button until it disappears or we hit the limit
      while (pageCount < maxPages) {
        pageCount++;
        console.log(`Scraping Dogs Home page ${pageCount}...`);

        // Wait for page content to load
        await new Promise((resolve) => setTimeout(resolve, 2000));

        // Scrape current page
        const currentPageDogs = await page.evaluate(() => {
          const results: {
            postUrl: string;
            imageUrl: string;
            name: string;
            breed?: string;
          }[] = [];

          // Look for the dog listing containers
          const dogContainers = document.querySelectorAll(
            '.col-sm-4.col-md-2.col-halfPadding'
          );

          dogContainers.forEach((container) => {
            const link = container.querySelector('a');
            const img = container.querySelector('img');
            const nameElement = container.querySelector('.thumbnailCaption h3');
            const breedElement = container.querySelector(
              '.thumbnailCaption p:last-child'
            );

            if (link && img && nameElement) {
              const href = (link as HTMLAnchorElement).href;
              const src = (img as HTMLImageElement).src;
              const name = nameElement.textContent?.trim() || '';

              // Extract breed information from the description paragraph
              let breed = '';
              if (breedElement) {
                const breedText = breedElement.textContent?.trim() || '';
                // Extract breed from format like "Staffordshire Bull Terrier (crossed), 5 years and 1 month, Male"
                const breedMatch = breedText.match(/^([^,]+)/);
                if (breedMatch) {
                  breed = breedMatch[1].trim();
                  // Clean up common suffixes
                  breed = breed.replace(/\s*\(crossed\)$/, ' Cross');
                  breed = breed.replace(/\s*\(mixed\)$/, ' Mix');
                }
              }

              if (href && src && name && name !== 'dog adoption photo') {
                results.push({
                  postUrl: href,
                  imageUrl: src,
                  name: name,
                  breed: breed || undefined,
                });
              }
            }
          });

          return results;
        });

        console.log(
          `Found ${currentPageDogs.length} dogs on page ${pageCount}`
        );

        // Add unique dogs to our collection (avoid duplicates across pages)
        const newDogs = currentPageDogs.filter(
          (dog) => !allDogs.some((existing) => existing.postUrl === dog.postUrl)
        );
        allDogs.push(...newDogs);
        console.log(
          `Added ${newDogs.length} new dogs (total: ${allDogs.length})`
        );

        // Look for "Next" button and click it
        const nextClicked = await page.evaluate(() => {
          const nextButton = document.querySelector('ul.pager li.next a');

          if (nextButton && (nextButton as HTMLElement).offsetParent !== null) {
            console.log('Found "Next" button, clicking...');
            (nextButton as HTMLElement).click();
            return { success: true };
          }

          return { success: false };
        });

        if (nextClicked.success) {
          console.log(`✅ Clicked "Next" button on page ${pageCount}`);
          // Wait for new page to load
          await new Promise((resolve) => setTimeout(resolve, 3000));
        } else {
          console.log(`🏁 No more "Next" button found - reached end`);
          break;
        }
      }

      if (allDogs.length > 0) {
        console.log(
          `Found ${allDogs.length} total dogs across ${pageCount} pages`
        );
        const saved = await saveDogs(allDogs);
        totalSaved += saved;
      } else {
        console.log('No dogs found - may need to adjust selectors');
      }
    } catch (error) {
      console.error('Error scraping Dogs Home:', error);
    } finally {
      await page.close();
    }

    console.log(
      `Dogshome: ${totalSaved} dogs scraped in ${Date.now() - startTime}ms`
    );
    return totalSaved;
  }

  async scrapePetRescue(): Promise<number> {
    console.log('Scraping petrescue.com.au (Dogs in Victoria)...');
    const startTime = Date.now();

    const url =
      'https://www.petrescue.com.au/listings/search/dogs?interstate=false&page=1&per_page=500&promotion_count=1&state_id%5B%5D=2';

    const scrapedDogs = await this.scrapeGeneric(url);

    // Process the scraped dogs to extract names and breeds from the format:
    // "Name - Breed" or "Name - Breed x Mixed breed Dog"
    const processedDogs = scrapedDogs.map((dog) => {
      let name = dog.name || 'Unknown';
      let breed = '';

      // Check if the name contains a dash (indicating name - breed format)
      if (name.includes(' - ')) {
        const parts = name.split(' - ');
        if (parts.length >= 2) {
          name = parts[0].trim();
          breed = parts[1].trim();

          // Clean up common breed suffixes
          breed = breed.replace(/ Dog$/, ''); // Remove " Dog" suffix
          breed = breed.replace(/^Mixed breed$/, 'Mixed Breed'); // Standardize mixed breed
        }
      }

      return {
        ...dog,
        name,
        breed,
      };
    });

    const saved = await saveDogs(processedDogs);
    console.log(
      `PetRescue: ${saved} dogs scraped in ${Date.now() - startTime}ms`
    );
    return saved;
  }

  async scrapeAdoptAPet(): Promise<number> {
    console.log('Scraping adoptapet.com.au...');
    const startTime = Date.now();
    let totalSaved = 0;

    const page = await this.createPage();

    try {
      // Set a shorter timeout and better error handling
      await page.goto('https://www.adoptapet.com.au/', {
        waitUntil: 'domcontentloaded',
        timeout: 15000,
      });

      // Wait for page to settle
      await new Promise((resolve) => setTimeout(resolve, 3000));

      // Try to find any modal/popup and close it
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
        if (await this.tryClick(page, selector)) {
          console.log(`Closed modal with selector: ${selector}`);
          await new Promise((resolve) => setTimeout(resolve, 1000));
          break;
        }
      }

      // Set filters for Dogs in Victoria (same approach as debug script)
      console.log('Setting filters for Dogs in Victoria...');

      // Set pet type to Dog
      const petTypeSet = await page.evaluate(() => {
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

      // Set state to Victoria
      const stateSet = await page.evaluate(() => {
        const selects = document.querySelectorAll('select');

        for (const select of selects) {
          // Check if this looks like a state selector
          const isStateSelect =
            select.name === 'state' ||
            select.id === 'state' ||
            select.className.includes('state');

          if (isStateSelect) {
            const options = Array.from(select.options);

            // Look for VIC option - try multiple approaches
            let vicOption = options.find(
              (option) => option.textContent?.toLowerCase().trim() === 'vic'
            );

            // If not found, try value "3" (Victoria's common value)
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

      // Click search/filter button
      console.log('Looking for search/submit button...');
      const searchClicked = await page.evaluate(() => {
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

      // Now scrape the filtered results with pagination
      console.log('Scraping filtered dog listings with pagination...');
      const allFilteredDogs: {
        postUrl: string;
        imageUrl: string;
        name: string;
      }[] = [];
      let pageCount = 0;
      const maxPages = 10; // Safety limit to prevent infinite loops

      // Keep clicking "Search more" button until it disappears or we hit the limit
      while (pageCount < maxPages) {
        pageCount++;
        console.log(`Scraping page ${pageCount}...`);

        // Scrape current page results
        const currentPageDogs = await page.evaluate(() => {
          const results: { postUrl: string; imageUrl: string; name: string }[] =
            [];

          // Try various selectors that might contain dog listings
          const selectors = [
            '.pet',
            '.animal',
            '.listing',
            '.card',
            '.dog-card',
            '.pet-card',
            '[data-pet]',
            '.adoption-listing',
            '.search-result',
            '.pet-listing',
            '.animal-listing',
          ];

          for (const selector of selectors) {
            const elements = document.querySelectorAll(selector);
            console.log(
              `Found ${elements.length} elements with selector: ${selector}`
            );

            elements.forEach((element) => {
              const link = element.querySelector('a') || element.closest('a');
              const img = element.querySelector('img');

              if (link && img) {
                const href = (link as HTMLAnchorElement).href;
                const src = (img as HTMLImageElement).src;
                const alt = (img as HTMLImageElement).alt || '';

                // More inclusive filtering since we've already filtered by form
                if (href && src) {
                  results.push({
                    postUrl: href,
                    imageUrl: src,
                    name: alt || 'Unknown Dog',
                  });
                }
              }
            });

            if (results.length > 0) break;
          }

          // If no structured listings found, try generic image scraping
          if (results.length === 0) {
            const images = document.querySelectorAll('img');
            images.forEach((img) => {
              const link =
                img.closest('a') || img.parentElement?.querySelector('a');
              if (link && img.src) {
                const href = (link as HTMLAnchorElement).href;
                const src = img.src;
                const alt = img.alt || '';

                // Since filters are applied, be more permissive
                if (
                  href &&
                  src &&
                  src.match(/\.(jpg|jpeg|png|webp)/i) &&
                  (href.includes('pet') ||
                    href.includes('dog') ||
                    href.includes('adopt') ||
                    href.includes('animal') ||
                    href.includes('profile'))
                ) {
                  results.push({
                    postUrl: href,
                    imageUrl: src,
                    name: alt || 'Unknown Dog',
                  });
                }
              }
            });
          }

          return results;
        });

        console.log(
          `Found ${currentPageDogs.length} dogs on page ${pageCount}`
        );

        // Add unique dogs to our collection (avoid duplicates across pages)
        const newDogs = currentPageDogs.filter(
          (dog) =>
            !allFilteredDogs.some(
              (existing) => existing.postUrl === dog.postUrl
            )
        );
        allFilteredDogs.push(...newDogs);
        console.log(
          `Added ${newDogs.length} new dogs (total: ${allFilteredDogs.length})`
        );

        // Look for "Search more" button
        const searchMoreClicked = await page.evaluate(() => {
          // Try multiple selectors for the "Search more" button
          const searchMoreSelectors = [
            '#search-more a',
            '#search-more',
            'a[href*="#"]:has-text("Search more")',
            'a:contains("Search more")',
            'a:contains("Show more")',
            'a:contains("Load more")',
            '.search-more',
            '.load-more',
            '.show-more',
          ];

          for (const selector of searchMoreSelectors) {
            try {
              // Use querySelector instead of complex selectors that might not work
              const button =
                document.querySelector('#search-more a') ||
                document.querySelector('#search-more') ||
                Array.from(document.querySelectorAll('a')).find(
                  (a) =>
                    a.textContent?.toLowerCase().includes('search more') ||
                    a.textContent?.toLowerCase().includes('show more') ||
                    a.textContent?.toLowerCase().includes('load more')
                );

              if (button && (button as HTMLElement).offsetParent !== null) {
                // Check if visible
                console.log(`Found "Search more" button, clicking...`);
                (button as HTMLElement).click();
                return { success: true, buttonFound: true };
              }
            } catch (e) {
              console.log(`Error trying selector ${selector}:`, e);
            }
          }

          return { success: false, buttonFound: false };
        });

        if (searchMoreClicked.success) {
          console.log(`✅ Clicked "Search more" button on page ${pageCount}`);
          // Wait for new content to load
          await new Promise((resolve) => setTimeout(resolve, 3000));
        } else {
          console.log(`🏁 No more "Search more" button found - reached end`);
          break;
        }
      }

      if (allFilteredDogs.length > 0) {
        console.log(
          `Found ${allFilteredDogs.length} total dogs across ${pageCount} pages`
        );
        const saved = await saveDogs(allFilteredDogs);
        totalSaved += saved;
      } else {
        console.log(
          'No dogs found after filtering - may need to adjust selectors'
        );
      }
    } catch (error) {
      console.error('Error scraping AdoptAPet:', error);
    } finally {
      await page.close();
    }

    console.log(
      `AdoptAPet: ${totalSaved} dogs scraped in ${Date.now() - startTime}ms`
    );
    return totalSaved;
  }

  async scrapeAll(): Promise<{ [key: string]: number }> {
    const results = {
      dogshome: 0,
      petrescue: 0,
      adoptapet: 0,
    };

    try {
      await this.init();

      results.dogshome = await this.scrapeDogshome();
      results.petrescue = await this.scrapePetRescue();
      results.adoptapet = await this.scrapeAdoptAPet();
    } finally {
      await this.close();
    }

    return results;
  }
}

// Helper function for API routes - now returns only traditional website results
export async function runScraping(config?: ScraperConfig) {
  const scraper = new DogScraper(config);
  return await scraper.scrapeAll();
}
