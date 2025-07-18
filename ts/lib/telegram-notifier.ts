// lib/telegram-notifier.ts
import TelegramBot from 'node-telegram-bot-api';
import { getTelegramCredentials } from './settings';
import type { Dog } from './schema';

export class TelegramNotifier {
  private bot: TelegramBot | null = null;
  private chatId: string | null = null;
  private isInitialized = false;

  async init(): Promise<boolean> {
    try {
      const { botToken, chatId, notificationsEnabled } =
        await getTelegramCredentials();

      if (!notificationsEnabled || !botToken || !chatId) {
        console.log('Telegram notifications not enabled or not configured');
        return false;
      }

      this.bot = new TelegramBot(botToken, { polling: false });
      this.chatId = chatId;
      this.isInitialized = true;

      console.log('Telegram notifier initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize Telegram notifier:', error);
      return false;
    }
  }

  async testConnection(): Promise<boolean> {
    if (!this.isInitialized || !this.bot || !this.chatId) {
      return false;
    }

    try {
      await this.bot.sendMessage(
        this.chatId,
        '🤖 Watchdog Telegram bot test - connection successful!'
      );
      return true;
    } catch (error) {
      console.error('Telegram test failed:', error);
      return false;
    }
  }

  async notifyNewDog(dog: Dog): Promise<boolean> {
    if (!this.isInitialized || !this.bot || !this.chatId) {
      console.log('Telegram notifier not initialized, skipping notification');
      return false;
    }

    try {
      const message = this.formatDogMessage(dog);

      if (dog.imageUrl) {
        // Send photo with caption
        await this.bot.sendPhoto(this.chatId, dog.imageUrl, {
          caption: message,
          parse_mode: 'Markdown',
        });
      } else {
        // Send text message only
        await this.bot.sendMessage(this.chatId, message, {
          parse_mode: 'Markdown',
        });
      }

      console.log(`Telegram notification sent for dog: ${dog.name}`);
      return true;
    } catch (error) {
      console.error('Failed to send Telegram notification:', error);
      return false;
    }
  }

  async notifyBatchResults(savedCount: number): Promise<boolean> {
    if (!this.isInitialized || !this.bot || !this.chatId || savedCount === 0) {
      return false;
    }

    const plural = savedCount === 1 ? '' : 's';

    try {
      const message =
        `🐕 *Watchdog Update*\n\n` +
        `Found *${savedCount}* new dog${plural}.\n\n` +
        `Check the app for more details!`;

      await this.bot.sendMessage(this.chatId, message, {
        parse_mode: 'Markdown',
      });

      console.log(`Telegram batch notification sent: ${savedCount} new dogs`);
      return true;
    } catch (error) {
      console.error('Failed to send Telegram batch notification:', error);
      return false;
    }
  }

  private formatDogMessage(dog: Dog): string {
    const name = dog.name || 'Unknown';
    const breed = dog.breed || 'Unknown breed';
    const description = dog.description || 'No description available';

    // Truncate description if too long
    const maxDescLength = 200;
    const truncatedDesc =
      description.length > maxDescLength
        ? description.substring(0, maxDescLength) + '...'
        : description;

    return (
      `🐕 *New Dog Available!*\n\n` +
      `*Name:* ${name}\n` +
      `*Breed:* ${breed}\n` +
      `*Description:* ${truncatedDesc}\n\n` +
      `[View Listing](${dog.postUrl})`
    );
  }
}

// Singleton instance
export const telegramNotifier = new TelegramNotifier();
