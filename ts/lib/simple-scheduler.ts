// lib/simple-scheduler.ts
import { runScraping } from './scraper';
import { getScrapeInterval } from './settings';
import { sendQueuedTelegramNotifications } from './scraper-utils';

export class SimpleScheduler {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;
  private currentInterval: number = 60; // minutes

  async start() {
    if (this.isRunning) {
      console.log('Scheduler is already running');
      return;
    }

    this.currentInterval = await getScrapeInterval();
    console.log(
      `Starting scheduler with ${this.currentInterval} minute intervals (Facebook disabled)`
    );

    // Start the interval
    this.intervalId = setInterval(async () => {
      try {
        console.log(
          `Starting scheduled scraping job (every ${this.currentInterval} minutes, Facebook disabled)...`
        );
        const results = await runScraping({ headless: true });
        const total = Object.values(results).reduce(
          (sum, count) => sum + count,
          0
        );
        console.log(`Scheduled scraping completed: ${total} dogs scraped`);
        
        // Send queued notifications after scraping
        if (total > 0) {
          console.log('📱 Sending queued Telegram notifications...');
          await sendQueuedTelegramNotifications();
        }
      } catch (error) {
        console.error('Scheduled scraping failed:', error);
      }
    }, this.currentInterval * 60 * 1000); // Convert minutes to milliseconds

    this.isRunning = true;

    // Also run immediately
    try {
      console.log('Running initial scraping job...');
      const results = await runScraping({ headless: true });
      const total = Object.values(results).reduce(
        (sum, count) => sum + count,
        0
      );
      console.log(`Initial scraping completed: ${total} dogs scraped`);
      
      // Send queued notifications after initial scraping
      if (total > 0) {
        console.log('📱 Sending queued Telegram notifications...');
        await sendQueuedTelegramNotifications();
      }
    } catch (error) {
      console.error('Initial scraping failed:', error);
    }
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('Scheduler stopped');
  }

  async updateInterval() {
    const newInterval = await getScrapeInterval();
    if (newInterval !== this.currentInterval) {
      console.log(
        `Updating scrape interval from ${this.currentInterval} to ${newInterval} minutes`
      );
      const wasRunning = this.isRunning;

      this.stop();

      if (wasRunning) {
        await this.start();
      }
    }
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      intervalMinutes: this.currentInterval,
      nextRunIn: this.isRunning ? 'Running on interval' : 'Stopped',
    };
  }
}

// Global scheduler instance
export const simpleScheduler = new SimpleScheduler();
