// lib/facebook-scraper.ts
import { Browser, Page } from 'puppeteer';
import { ScrapedDog, saveDogs } from './scraper-utils';
import { getFacebookCredentials } from './settings';
import {
  setupAntiDetection,
  waitForElementWithTimeout,
  waitForElementsWithTimeout,
  tryClick,
  retryOperation,
  scrollToBottom,
} from './browser-utils';

export class FacebookScraper {
  private browser: Browser;
  private page: Page | null = null;
  private isLoggedIn: boolean = false;

  constructor(browser: Browser) {
    this.browser = browser;
  }

  async init(): Promise<void> {
    this.page = await this.browser.newPage();
    await setupAntiDetection(this.page);
  }

  async close(): Promise<void> {
    if (this.page) {
      await this.page.close();
      this.page = null;
    }
  }

  async login(): Promise<boolean> {
    if (!this.page) {
      throw new Error('Page not initialized. Call init() first.');
    }

    if (this.isLoggedIn) {
      console.log('🔐 Already logged in to Facebook');
      return true;
    }

    try {
      console.log('🔐 Logging in to Facebook...');

      const { email, password } = await getFacebookCredentials();
      if (!email || !password) {
        throw new Error(
          'Facebook credentials not found. Please set them first.'
        );
      }

      // Navigate to Facebook mobile login
      await this.page.goto('https://m.facebook.com', {
        waitUntil: 'domcontentloaded',
        timeout: 15000,
      });

      // Wait for and fill email input
      const emailInput = await waitForElementWithTimeout(
        this.page,
        '#m_login_email',
        5000
      );
      if (!emailInput) {
        throw new Error('Email input not found');
      }
      await this.page.type('#m_login_email', email);

      // Wait for and fill password input
      const passwordInput = await waitForElementWithTimeout(
        this.page,
        '#m_login_password',
        5000
      );
      if (!passwordInput) {
        throw new Error('Password input not found');
      }
      await this.page.type('#m_login_password', password);

      // Click login button - Facebook now uses a div with role="button" and aria-label="Log in"
      const loginButton = await waitForElementWithTimeout(
        this.page,
        '._56bu',
        5000
      );
      if (!loginButton) {
        throw new Error('Login button not found');
      }
      await this.page.click('._56bu');

      // Wait for navigation or error
      await this.page.waitForNavigation({
        waitUntil: 'domcontentloaded',
        timeout: 10000,
      });

      // Handle "Not Now" popup if it appears
      await tryClick(this.page, '#_56bw');

      // Check if login was successful by looking for typical Facebook mobile elements
      const isSuccess = await this.page.evaluate(() => {
        return !document.querySelector('#m_login_email'); // Login form should be gone
      });

      if (isSuccess) {
        console.log('✅ Successfully logged in to Facebook');
        this.isLoggedIn = true;
        return true;
      } else {
        throw new Error('Login appears to have failed');
      }
    } catch (error) {
      console.error('❌ Facebook login failed:', error);
      return false;
    }
  }

  async scrapeGroup(groupId: string): Promise<ScrapedDog[]> {
    if (!this.page) {
      throw new Error('Page not initialized. Call init() first.');
    }

    console.log(`📘 Scraping Facebook group ${groupId}...`);

    return (
      (await retryOperation(async () => {
        return await this._scrapeFacebookUrl(
          `https://m.facebook.com/groups/${groupId}`
        );
      })) || []
    );
  }

  async scrapePage(pageName: string): Promise<ScrapedDog[]> {
    if (!this.page) {
      throw new Error('Page not initialized. Call init() first.');
    }

    console.log(`📘 Scraping Facebook page ${pageName}...`);

    return (
      (await retryOperation(async () => {
        return await this._scrapeFacebookUrl(
          `https://m.facebook.com/${pageName}/posts`
        );
      })) || []
    );
  }

  private async _scrapeFacebookUrl(url: string): Promise<ScrapedDog[]> {
    if (!this.page) {
      throw new Error('Page not initialized');
    }

    const dogs: ScrapedDog[] = [];

    try {
      // Navigate to the URL
      await this.page.goto(url, {
        waitUntil: 'domcontentloaded',
        timeout: 15000,
      });

      // Wait for posts to load
      await waitForElementsWithTimeout(this.page, '._78cz', 5000);

      // Scroll to load more content
      await scrollToBottom(this.page, 2, 1000);

      // Find all post links
      const postLinks = await this.page.$$('._78cz');

      for (const linkDiv of postLinks) {
        try {
          // Get the post URL
          const linkElement = await linkDiv.$('a');
          if (!linkElement) continue;

          const href = await this.page.evaluate(
            (el) => el.getAttribute('href'),
            linkElement
          );
          if (!href) continue;

          // Convert mobile URLs to desktop URLs
          const postUrl = href
            .replace('m.facebook', 'facebook')
            .replace('touch.facebook', 'facebook');

          // Find the parent story container
          let parent = linkDiv;
          let attempts = 0;
          while (attempts < 10) {
            const className = await this.page.evaluate(
              (el) => el.getAttribute('class'),
              parent
            );
            if (className && className.includes('story_body_container')) {
              break;
            }
            try {
              const parentElement = await this.page.evaluateHandle(
                (el) => el.parentElement,
                parent
              );
              if (!parentElement) break;
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              parent = parentElement as any;
              attempts++;
            } catch {
              break;
            }
          }

          if (!parent) continue;

          // Look for images in the story container
          let imageUrl: string | null = null;

          // Try different image classes that Facebook uses
          const imageClasses = ['_5sgi', '_2sxw', 'datstx6m'];

          for (const imgClass of imageClasses) {
            const images = await parent.$$(`img.${imgClass}`);
            if (images.length > 0) {
              imageUrl = await this._getImageSrc(images[0]);
              if (imageUrl) break;
            }
          }

          // If we found both URL and image, add to results
          if (postUrl && imageUrl) {
            dogs.push({
              postUrl: postUrl,
              imageUrl: imageUrl,
            });
          }
        } catch (error) {
          console.error('Error processing post:', error);
          continue;
        }
      }

      console.log(`Found ${dogs.length} dogs in ${url}`);
      return dogs;
    } catch (error) {
      console.error(`Error scraping ${url}:`, error);
      return [];
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async _getImageSrc(imageElement: any): Promise<string | null> {
    try {
      // Try to get src attribute first
      const src = await this.page!.evaluate(
        (el) => el.getAttribute('src'),
        imageElement
      );
      if (src) return src;

      // Try to get background-image from CSS if src is not available
      const backgroundImage = await this.page!.evaluate((el: Element) => {
        return window.getComputedStyle(el).backgroundImage;
      }, imageElement);

      if (backgroundImage && backgroundImage !== 'none') {
        // Extract URL from background-image CSS property
        const match = backgroundImage.match(/url\(["']?([^"')]+)["']?\)/);
        if (match && match[1]) {
          return match[1];
        }
      }

      return null;
    } catch (error) {
      console.error('Error extracting image src:', error);
      return null;
    }
  }

  async scrapeAll(): Promise<number> {
    if (!this.page) {
      await this.init();
    }

    // Ensure we're logged in
    const loginSuccess = await this.login();
    if (!loginSuccess) {
      console.error('❌ Cannot proceed without Facebook login');
      return 0;
    }

    const allDogs: ScrapedDog[] = [];

    // Facebook groups to scrape (from original Python code)
    const groups = ['571800346240922', '611101722623366'];

    // Facebook pages to scrape (from original Python code)
    const pages = [
      'DogRescueAssociationofVictoria',
      'vicdogrescue',
      'StartingOverDogRescue',
      'All4PawsDogRescue',
      'SecondChanceAnimalRescueInc',
      'PuppyTalesRescue',
      'rescuedwithlove',
      'FFARLatrobe',
      'FFARau',
      'LostDogsHome',
      'PetRescueAU',
      'RSPCA.Victoria',
      'petshavenfoundation',
      'Australiank9rescuevic',
      'TheAnimalRehomingService',
      'melbourneanimalrescue',
      'newbeginnings.animalrescueinc',
      'Krazy-Kat-Rescue-974224009276491',
    ];

    console.log(
      `🐕 Scraping ${groups.length} Facebook groups and ${pages.length} Facebook pages...`
    );

    try {
      // Scrape groups
      for (const groupId of groups) {
        try {
          const groupDogs = await this.scrapeGroup(groupId);
          allDogs.push(...groupDogs);
          console.log(`✅ Group ${groupId}: ${groupDogs.length} dogs found`);

          // Add delay between requests to avoid rate limiting
          await new Promise((resolve) => setTimeout(resolve, 2000));
        } catch (error) {
          console.error(`❌ Error scraping group ${groupId}:`, error);
        }
      }

      // Scrape pages
      for (const pageName of pages) {
        try {
          const pageDogs = await this.scrapePage(pageName);
          allDogs.push(...pageDogs);
          console.log(`✅ Page ${pageName}: ${pageDogs.length} dogs found`);

          // Add delay between requests to avoid rate limiting
          await new Promise((resolve) => setTimeout(resolve, 2000));
        } catch (error) {
          console.error(`❌ Error scraping page ${pageName}:`, error);
        }
      }

      // Save all dogs to database
      const savedCount = await saveDogs(allDogs);
      console.log(
        `💾 Saved ${savedCount} new dogs from Facebook (${allDogs.length} total found)`
      );

      return savedCount;
    } catch (error) {
      console.error('❌ Error during Facebook scraping:', error);
      return 0;
    }
  }
}
