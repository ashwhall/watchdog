// scripts/debug-save.ts
import { DogScraper } from '../lib/scraper';
import { saveDogs } from '../lib/scraper-utils';

async function debugSave() {
  console.log('🔍 Debugging save process...');

  const scraper = new DogScraper({ headless: true });

  try {
    await scraper.init();

    // Test just one URL to see what happens
    const url =
      'https://dogshome.com/dog-adoption/adopt-a-dog/?sex=&breed1=&age=&animalid=&Submit=Submit&resulttype=1';
    console.log(`Testing: ${url}`);

    const scrapedDogs = await scraper.scrapeGeneric(url);
    console.log(`Found ${scrapedDogs.length} dogs`);

    if (scrapedDogs.length > 0) {
      console.log('\n📄 Sample dog data:');
      console.log(JSON.stringify(scrapedDogs[0], null, 2));

      console.log('\n💾 Attempting to save...');
      const saved = await saveDogs(scrapedDogs);
      console.log(`Saved: ${saved} dogs`);

      if (saved === 0 && scrapedDogs.length > 0) {
        console.log('\n🔍 Investigating why no dogs were saved...');

        // Check if dogs already exist in database
        const { db } = await import('../lib/db');
        const { dogs } = await import('../lib/schema');
        const { eq } = await import('drizzle-orm');

        for (let i = 0; i < Math.min(3, scrapedDogs.length); i++) {
          const dog = scrapedDogs[i];
          console.log(`\nChecking dog ${i + 1}: ${dog.postUrl}`);

          const existing = await db
            .select()
            .from(dogs)
            .where(eq(dogs.postUrl, dog.postUrl))
            .limit(1);

          if (existing.length > 0) {
            console.log(
              `  ✅ Already exists in database (ID: ${existing[0].id})`
            );
          } else {
            console.log(`  ❌ Not in database - this should have been saved!`);

            // Try to save this specific dog manually
            try {
              await db.insert(dogs).values({
                name: dog.name || 'Unknown',
                breed: null,
                postUrl: dog.postUrl,
                imageUrl: dog.imageUrl,
                description: dog.description || '',
                scrapedAt: new Date(),
              });
              console.log(`  ✅ Manually saved successfully`);
            } catch (saveError) {
              console.log(`  ❌ Manual save failed:`, saveError);
            }
          }
        }
      }
    }
  } catch (error) {
    console.error('❌ Debug error:', error);
  } finally {
    await scraper.close();
  }
}

debugSave()
  .then(() => {
    console.log('🎉 Debug completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Debug failed:', error);
    process.exit(1);
  });
