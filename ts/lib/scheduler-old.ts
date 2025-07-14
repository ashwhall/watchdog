// lib/scheduler.ts
import { runScraping } from './scraper';
import { getScrapeInterval } from './settings';

// Use dynamic import to avoid Next.js module resolution issues
// eslint-disable-next-line @typescript-eslint/no-require-imports
const cron = require('node-cron');

// lib/scheduler.ts
import { runScraping } from './scraper';
import { getScrapeInterval } from './settings';

type ScheduledTask = {
  start: () => void;
  stop: () => void;
  destroy: () => void;
  getStatus: () => string;
};

export class ScrapingScheduler {
  private tasks: Map<string, ScheduledTask> = new Map();
  private currentInterval: number = 60; // default 60 minutes

  // Schedule scraping based on the interval setting (Facebook disabled for scheduled runs)
  async scheduleIntervalScraping() {
    this.currentInterval = await getScrapeInterval();

    // Convert minutes to cron expression
    const cronExpression =
      this.currentInterval >= 60
        ? `0 */${Math.floor(this.currentInterval / 60)} * * *` // hourly intervals
        : `*/${this.currentInterval} * * * *`; // minute intervals

    // Dynamic import to avoid Next.js issues
    const cron = await import('node-cron');

    const task = cron.schedule(
      cronExpression,
      async () => {
        console.log(
          `Starting scheduled scraping job (every ${this.currentInterval} minutes, Facebook disabled)...`
        );
        try {
          // Only run traditional website scraping (no Facebook)
          const results = await runScraping({ headless: true });
          const total = Object.values(results).reduce(
            (sum, count) => sum + count,
            0
          );
          console.log(`Scheduled scraping completed: ${total} dogs scraped`);
        } catch (error) {
          console.error('Scheduled scraping failed:', error);
        }
      },
      {
        timezone: 'Australia/Melbourne',
      }
    );

    this.tasks.set('interval', task);
    return task;
  }

  // Legacy method - kept for backward compatibility but using interval setting
  async scheduleDailyScraping() {
    console.log(
      'scheduleDailyScraping is deprecated, use scheduleIntervalScraping instead'
    );
    return this.scheduleIntervalScraping();
  }

  // Legacy method - kept for backward compatibility but disabled
  scheduleHourlyScraping() {
    console.log('scheduleHourlyScraping is deprecated and disabled');
    return null;
  }

  // Add method to update the schedule when interval changes
  async updateSchedule() {
    const newInterval = await getScrapeInterval();
    if (newInterval !== this.currentInterval) {
      console.log(
        `Updating scrape interval from ${this.currentInterval} to ${newInterval} minutes`
      );

      // Stop and destroy existing task
      this.destroyTask('interval');

      // Create new task with updated interval
      await this.scheduleIntervalScraping();
      this.startTask('interval');
    }
  }

  startTask(taskName: string) {
    const task = this.tasks.get(taskName);
    if (task) {
      task.start();
      console.log(`Started ${taskName} scraping task`);
    }
  }

  stopTask(taskName: string) {
    const task = this.tasks.get(taskName);
    if (task) {
      task.stop();
      console.log(`Stopped ${taskName} scraping task`);
    }
  }

  destroyTask(taskName: string) {
    const task = this.tasks.get(taskName);
    if (task) {
      task.destroy();
      this.tasks.delete(taskName);
      console.log(`Destroyed ${taskName} scraping task`);
    }
  }

  getTaskStatus() {
    const status: { [key: string]: boolean } = {};
    this.tasks.forEach((task, name) => {
      status[name] = task.getStatus() === 'scheduled';
    });
    return status;
  }

  async setupAllTasks() {
    // Use the new interval-based scheduling
    await this.scheduleIntervalScraping();

    // Start interval task by default
    this.startTask('interval');

    console.log('All scraping tasks set up');
  }
}

// Global scheduler instance
export const scheduler = new ScrapingScheduler();

// Initialize tasks when module is loaded (only in production or when explicitly enabled)
if (
  process.env.NODE_ENV === 'production' ||
  process.env.ENABLE_SCHEDULER === 'true'
) {
  scheduler.setupAllTasks();
}
