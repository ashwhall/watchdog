// src/pages/api/scraper/schedule.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { scheduler } from '../../../../lib/scheduler';
import { getScrapeInterval } from '../../../../lib/settings';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method) {
    case 'GET':
      // Get scheduler status
      try {
        const status = scheduler.getTaskStatus();
        const currentInterval = await getScrapeInterval();
        res.status(200).json({
          success: true,
          tasks: status,
          scrapeInterval: currentInterval,
          message: `Scheduler running with ${currentInterval} minute intervals. Facebook scraping is disabled for scheduled runs.`,
        });
      } catch (error) {
        console.error('Scheduler status error:', error);
        res.status(500).json({
          success: false,
          error: 'Failed to get scheduler status',
        });
      }
      break;

    case 'POST':
      // Start/stop/restart tasks or update schedule
      try {
        const { action, task } = req.body;

        if (!action) {
          return res.status(400).json({
            success: false,
            error: 'Action is required',
          });
        }

        switch (action) {
          case 'start':
            if (!task) {
              return res.status(400).json({
                success: false,
                error: 'Task is required for start action',
              });
            }
            scheduler.startTask(task);
            break;
          case 'stop':
            if (!task) {
              return res.status(400).json({
                success: false,
                error: 'Task is required for stop action',
              });
            }
            scheduler.stopTask(task);
            break;
          case 'restart':
            if (!task) {
              return res.status(400).json({
                success: false,
                error: 'Task is required for restart action',
              });
            }
            scheduler.stopTask(task);
            scheduler.startTask(task);
            break;
          case 'update-schedule':
            // Update the schedule to use the current interval setting
            await scheduler.updateSchedule();
            break;
          case 'setup':
            // Setup all tasks
            await scheduler.setupAllTasks();
            break;
          default:
            return res.status(400).json({
              success: false,
              error:
                'Invalid action. Use start, stop, restart, update-schedule, or setup',
            });
        }

        const currentInterval = await getScrapeInterval();
        res.status(200).json({
          success: true,
          message: `Task ${task || 'schedule'} ${action}ed successfully`,
          tasks: scheduler.getTaskStatus(),
          scrapeInterval: currentInterval,
        });
      } catch (error) {
        res.status(500).json({
          success: false,
          error: 'Failed to manage scheduler',
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
      break;

    default:
      res.status(405).json({ error: 'Method not allowed' });
  }
}
