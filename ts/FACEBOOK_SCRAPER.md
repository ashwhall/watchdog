# Facebook Scraper - TypeScript Implementation

This document describes the TypeScript implementation of the Facebook scraper, converted from the original Python version in `scrape.py`.

## Architecture Overview

The Facebook scraping functionality has been split into several focused modules:

### Core Files

1. **`lib/facebook-scraper.ts`** - Main FacebookScraper class
2. **`lib/browser-utils.ts`** - Shared browser utilities and anti-detection measures
3. **`lib/scraper-utils.ts`** - Database operations and data structures
4. **`lib/settings.ts`** - Credential management

### Scripts

1. **`scripts/facebook-scrape-all.ts`** - Full Facebook scraping (equivalent to Python version)
2. **`scripts/test-facebook-implementation.ts`** - Test script for development
3. **`scripts/open-facebook-browser.ts`** - Manual browser for debugging (updated to use shared utils)

## Key Features

### Anti-Detection Measures

The implementation includes comprehensive anti-detection measures to avoid Facebook's bot detection:

- Mobile user agent spoofing
- Webdriver property hiding
- Plugin array spoofing
- Language header manipulation
- Permission API override
- Realistic browser headers
- Mobile viewport simulation

### Session Persistence

- Login session is maintained between page/group visits
- Automatic credential retrieval using `getFacebookCredentials()`
- Proper error handling for authentication failures

### Robust Error Handling

- Retry mechanisms for failed operations
- Graceful handling of missing elements
- Timeout management for slow-loading pages
- Comprehensive logging for debugging

## Usage

### Prerequisites

1. **Set Facebook Credentials**: Use the web interface at `/settings` or run:

   ```bash
   npm run init-settings
   ```

2. **Database Setup**: Ensure the database is initialized:
   ```bash
   npm run db:setup
   ```

### Running Facebook Scraping

#### Full Scraping (All Groups and Pages)

```bash
npm run scrape:facebook-all
```

#### Test Implementation

```bash
npm run facebook:test
```

#### Manual Browser for Debugging

```bash
npm run facebook:browser
```

#### Integration with Full Scraper

```bash
npm run scrape:all             # All sources including Facebook
npm run scrape:all -- --facebook-only  # Facebook only
```

## Facebook Sources

The scraper targets the same Facebook sources as the Python version:

### Facebook Groups

- `571800346240922`
- `611101722623366`

### Facebook Pages

- DogRescueAssociationofVictoria
- vicdogrescue
- StartingOverDogRescue
- All4PawsDogRescue
- SecondChanceAnimalRescueInc
- PuppyTalesRescue
- rescuedwithlove
- FFARLatrobe
- FFARau
- LostDogsHome
- PetRescueAU
- RSPCA.Victoria
- petshavenfoundation
- Australiank9rescuevic
- TheAnimalRehomingService
- melbourneanimalrescue
- newbeginnings.animalrescueinc
- Krazy-Kat-Rescue-974224009276491

## Implementation Details

### FacebookScraper Class

```typescript
class FacebookScraper {
  constructor(browser: Browser);
  async init(): Promise<void>;
  async login(): Promise<boolean>;
  async scrapeGroup(groupId: string): Promise<ScrapedDog[]>;
  async scrapePage(pageName: string): Promise<ScrapedDog[]>;
  async scrapeAll(): Promise<number>;
  async close(): Promise<void>;
}
```

### Data Flow

1. **Initialize**: Create browser, set up anti-detection
2. **Login**: Authenticate with Facebook using stored credentials
3. **Scrape**: Visit each group/page, extract post URLs and image URLs
4. **Save**: Store new dogs in database (avoiding duplicates)
5. **Cleanup**: Close browser and connections

### URL Handling

- Uses Facebook mobile site (`m.facebook.com`) for easier scraping
- Converts mobile URLs to desktop URLs for storage
- Handles both group and page URL formats

### Image Extraction

The scraper extracts images using multiple strategies:

- Direct `src` attribute
- CSS `background-image` property
- Multiple Facebook-specific CSS classes

## Common Issues and Solutions

### Login Issues

- **Problem**: Login fails or gets blocked
- **Solution**: Use manual browser mode to verify credentials and check for 2FA requirements

### Rate Limiting

- **Problem**: Facebook blocks requests
- **Solution**: Delays are built in between requests. Adjust delay times if needed.

### Missing Elements

- **Problem**: Elements not found due to Facebook layout changes
- **Solution**: Update CSS selectors in the scraper code

### Credential Management

- **Problem**: Credentials not found
- **Solution**: Set credentials via web interface or use `getFacebookCredentials()` function

## Development

### Testing Individual Components

```bash
# Test specific page
const scraper = new FacebookScraper(browser);
await scraper.init();
await scraper.login();
const dogs = await scraper.scrapePage('PetRescueAU');
```

### Debugging

1. **Enable Headful Mode**: Set `headless: false` in browser creation
2. **Add Logging**: Use console.log statements in scraper methods
3. **Manual Browser**: Use `npm run facebook:browser` for manual testing

### Adding New Sources

To add new Facebook pages or groups:

1. Add the ID/name to the appropriate array in `scrapeAll()` method
2. Test with a single source first
3. Update this documentation

## Migration from Python

The TypeScript implementation maintains the same functionality as the original Python version:

### Equivalent Functions

| Python Function            | TypeScript Method                      |
| -------------------------- | -------------------------------------- |
| `fb_login()`               | `FacebookScraper.login()`              |
| `scrape_fb_group()`        | `FacebookScraper.scrapeGroup()`        |
| `scrape_fb_page()`         | `FacebookScraper.scrapePage()`         |
| `_scrape_fb()`             | `FacebookScraper._scrapeFacebookUrl()` |
| `get_img_src()`            | `FacebookScraper._getImageSrc()`       |
| `selenium_get_with_wait()` | `waitForElementWithTimeout()`          |
| `retry_selenium()`         | `retryOperation()`                     |

### Key Improvements

1. **Better Type Safety**: Full TypeScript typing
2. **Modular Design**: Separated concerns into focused modules
3. **Shared Utilities**: Common browser functions reusable across scrapers
4. **Better Error Handling**: More robust error management
5. **Session Management**: Proper login session persistence
6. **Testing Infrastructure**: Dedicated test scripts
