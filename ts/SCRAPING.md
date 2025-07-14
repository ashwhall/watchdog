# Dog Scraping System

A unified scraping system for dog adoption websites including Facebook pages and groups.

## Architecture

### Core Components

- **`lib/scraper.ts`** - Main scraper for traditional websites (dogshome.com, petrescue.com.au, adoptapet.com.au)
- **`lib/facebook-scraper.ts`** - Dedicated Facebook scraper with anti-detection measures
- **`lib/scraper-utils.ts`** - Shared utilities for saving scraped data
- **`scripts/scrape-all.ts`** - Unified entry point for all scraping operations

### Facebook Integration

The Facebook scraper includes:

- **Mobile-first approach** - Uses `m.facebook.com` for simpler selectors
- **Human-like behavior** - Character-by-character typing with random delays
- **Anti-detection measures** - Browser flags, header spoofing, and navigator overrides
- **Robust error handling** - Screenshots, detailed logging, and checkpoint detection

## Usage

### Run All Scrapers

```bash
npm run scrape
```

This will:

1. Scrape traditional websites (dogshome, petrescue, adoptapet)
2. Scrape Facebook pages and groups (if credentials configured)
3. Save all results to the database
4. Provide a detailed summary

### Test Individual Components

```bash
# Test only traditional websites
npm run test-scraper
```

## Configuration

1. **Database Setup**

```bash
npm run db:setup
npm run init-settings
```

2. **Facebook Credentials** (Optional)

- Navigate to `/settings` in the web UI
- Add your Facebook email and password
- Credentials are encrypted and stored securely

## Facebook Sources

The system monitors these Facebook sources:

- **Groups**: 2 rescue groups
- **Pages**: 15+ rescue organizations including:
  - Dog Rescue Association of Victoria
  - Lost Dogs Home
  - RSPCA Victoria
  - Pet Rescue AU
  - And many more...

## Tips for Facebook Scraping

1. **Use an established account** - Older accounts with normal activity are less likely to trigger captchas
2. **Login manually first** - Use a regular browser to establish account trust
3. **Consistent IP** - Don't change networks frequently
4. **Reasonable frequency** - Don't scrape too often (recommend once every few hours)

## Error Handling

- All scrapers include comprehensive error handling
- Screenshots are saved for debugging failed operations
- Detailed logging helps identify issues
- Graceful degradation when individual sources fail
