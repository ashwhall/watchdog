// lib/browser-utils.ts
import puppeteer, { Browser, Page } from 'puppeteer';

export interface BrowserConfig {
  headless?: boolean;
  timeout?: number;
  userAgent?: string;
}

export async function createBrowser(
  config: BrowserConfig = {}
): Promise<Browser> {
  return await puppeteer.launch({
    headless: config.headless ?? true,
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
      // DNS resolution improvements
      '--dns-prefetch-disable',
      '--disable-dns-over-https',
      '--aggressive-cache-discard',
      '--disable-background-networking',
    ],
  });
}

export async function setupAntiDetection(page: Page): Promise<void> {
  // Set mobile user agent for Facebook mobile site
  await page.setUserAgent(
    'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Mobile Safari/537.36'
  );

  // Set viewport to common mobile size
  await page.setViewport({ width: 375, height: 812 });

  // Override webdriver property
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', {
      get: () => undefined,
    });
  });

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
}

export async function waitForElementWithTimeout<T>(
  page: Page,
  selector: string,
  timeout: number = 3000,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  operation: (element: any) => Promise<T> | T = (el) => el
): Promise<T | null> {
  try {
    await page.waitForSelector(selector, { timeout });
    const element = await page.$(selector);
    if (element) {
      return await operation(element);
    }
  } catch {
    // Timeout or element not found
  }
  return null;
}

export async function waitForElementsWithTimeout<T>(
  page: Page,
  selector: string,
  timeout: number = 3000,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  operation?: (elements: any[]) => Promise<T> | T
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<T | any[] | null> {
  try {
    await page.waitForSelector(selector, { timeout });
    const elements = await page.$$(selector);
    if (elements && elements.length > 0) {
      return operation ? await operation(elements) : elements;
    }
  } catch {
    // Timeout or elements not found
  }
  return null;
}

export async function tryClick(page: Page, selector: string): Promise<boolean> {
  try {
    const element = await page.$(selector);
    if (element) {
      await element.click();
      return true;
    }
  } catch {
    // Click failed or element not found
  }
  return false;
}

export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T | null> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      console.error(`Attempt ${attempt} failed:`, error);
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  console.error(`Failed after ${maxRetries} attempts`);
  return null;
}

export async function scrollToBottom(
  page: Page,
  scrollCount: number = 2,
  delay: number = 1000
): Promise<void> {
  for (let i = 0; i < scrollCount; i++) {
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
}
