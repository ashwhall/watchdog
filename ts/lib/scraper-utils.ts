// lib/scraper-utils.ts
import { db } from './db';
import { dogs } from './schema';
import { eq } from 'drizzle-orm';
import { telegramNotifier } from './telegram-notifier';

export interface ScrapedDog {
  name?: string;
  breed?: string;
  postUrl: string;
  imageUrl: string;
  description?: string;
}

export async function saveDogs(
  scrapedDogs: ScrapedDog[],
  sendNotifications = true
): Promise<number> {
  let saved = 0;
  let duplicates = 0;
  const newDogs: (typeof dogs.$inferSelect)[] = [];

  console.log(`Processing ${scrapedDogs.length} scraped dogs...`);

  for (const dog of scrapedDogs) {
    try {
      // Check if already exists
      const existing = await db
        .select()
        .from(dogs)
        .where(eq(dogs.postUrl, dog.postUrl))
        .limit(1);

      if (existing.length === 0) {
        const newDogData = {
          name: dog.name || 'Unknown',
          breed: dog.breed || '', // Use scraped breed if available, otherwise empty for ML service
          postUrl: dog.postUrl,
          imageUrl: dog.imageUrl,
          description: dog.description || '',
          scrapedAt: new Date(),
        };

        const result = await db.insert(dogs).values(newDogData).returning();
        if (result.length > 0) {
          newDogs.push(result[0]);
          saved++;
          console.log(
            `✅ NEW DOG: ${dog.name || 'Unknown'}${
              dog.breed ? ` (${dog.breed})` : ''
            } - ${dog.postUrl}`
          );
        }
      } else {
        duplicates++;
        console.log(
          `⏭️  DUPLICATE: ${dog.name || 'Unknown'}${
            dog.breed ? ` (${dog.breed})` : ''
          } - ${dog.postUrl}`
        );
      }
    } catch (error) {
      console.error(`Error saving dog:`, error);
    }
  }

  console.log(`📊 SCRAPE SUMMARY: ${saved} new dogs, ${duplicates} duplicates`);

  // Send Telegram notifications for new dogs ONLY
  if (sendNotifications && newDogs.length > 0) {
    console.log(
      `🔔 Sending Telegram notifications for ${newDogs.length} new dogs...`
    );
    await sendTelegramNotifications(newDogs);
  } else if (sendNotifications && newDogs.length === 0) {
    console.log(`🔕 No new dogs found - no notifications sent`);
  }

  return saved;
}

async function sendTelegramNotifications(
  newDogs: (typeof dogs.$inferSelect)[]
): Promise<void> {
  try {
    // Initialize telegram notifier if not already done
    const initialized = await telegramNotifier.init();
    if (!initialized) {
      console.log('Telegram notifications not configured, skipping');
      return;
    }

    // Send individual notifications for each new dog
    for (const dog of newDogs) {
      await telegramNotifier.notifyNewDog(dog);
      // Small delay between messages to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    // Send a summary notification if multiple dogs were found
    if (newDogs.length > 1) {
      await telegramNotifier.notifyBatchResults(newDogs.length);
    }
  } catch (error) {
    console.error('Error sending Telegram notifications:', error);
  }
}
