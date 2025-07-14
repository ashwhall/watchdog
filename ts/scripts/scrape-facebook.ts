// scripts/scrape-facebook.ts
import { scrapeAll } from './scrape-all';

async function scrapeFacebookOnly() {
  console.log('📘 Running Facebook-only scraping...');
  return await scrapeAll({ facebookOnly: true });
}

// Run if called directly
if (require.main === module) {
  scrapeFacebookOnly().catch(console.error);
}

export { scrapeFacebookOnly };
