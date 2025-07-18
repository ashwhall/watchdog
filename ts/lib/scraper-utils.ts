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

// Queue for batch notifications
let notificationQueue: (typeof dogs.$inferSelect)[] = [];

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

  // Store new dogs in a queue for batch notifications instead of sending immediately
  if (sendNotifications && newDogs.length > 0) {
    console.log(
      `🔔 Queuing ${newDogs.length} new dogs for batch notifications...`
    );
    queueTelegramNotifications(newDogs);
  } else if (sendNotifications && newDogs.length === 0) {
    console.log(`🔕 No new dogs found - no notifications to queue`);
  }

  return saved;
}

function queueTelegramNotifications(
  newDogs: (typeof dogs.$inferSelect)[]
): void {
  notificationQueue.push(...newDogs);
  console.log(`📤 Added ${newDogs.length} dogs to notification queue (total: ${notificationQueue.length})`);
}

export async function sendQueuedTelegramNotifications(): Promise<void> {
  if (notificationQueue.length === 0) {
    console.log('🔕 No queued notifications to send');
    return;
  }

  console.log(`🔔 Sending ${notificationQueue.length} queued Telegram notifications...`);
  
  try {
    // Initialize telegram notifier if not already done
    const initialized = await telegramNotifier.init();
    if (!initialized) {
      console.log('Telegram notifications not configured, skipping');
      return;
    }

    // Send individual notifications for each new dog with 500ms delays
    for (let i = 0; i < notificationQueue.length; i++) {
      const dog = notificationQueue[i];
      await telegramNotifier.notifyNewDog(dog);
      console.log(`📱 Sent notification ${i + 1}/${notificationQueue.length} for: ${dog.name}`);
      
      // Wait 500ms between messages to avoid rate limiting
      if (i < notificationQueue.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }

    // Send a summary notification if multiple dogs were found
    if (notificationQueue.length > 1) {
      await telegramNotifier.notifyBatchResults(notificationQueue.length);
    }

    console.log(`✅ Successfully sent ${notificationQueue.length} Telegram notifications`);
  } catch (error) {
    console.error('Error sending queued Telegram notifications:', error);
  } finally {
    // Clear the queue after sending
    notificationQueue = [];
  }
}

// Legacy function for backward compatibility (now unused)
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
