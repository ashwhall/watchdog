// src/pages/api/test-scheduler.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { simpleScheduler } from '../../../lib/simple-scheduler';
import { getScrapeInterval } from '../../../lib/settings';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    try {
      const interval = await getScrapeInterval();
      const status = simpleScheduler.getStatus();

      res.status(200).json({
        success: true,
        message: 'Simple scheduler test endpoint',
        currentInterval: interval,
        schedulerStatus: status,
        instructions: {
          start: 'POST /api/test-scheduler with {"action": "start"}',
          stop: 'POST /api/test-scheduler with {"action": "stop"}',
          status: 'GET /api/test-scheduler',
          update: 'POST /api/test-scheduler with {"action": "update"}',
        },
        note: 'Facebook scraping is disabled for scheduled runs',
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  } else if (req.method === 'POST') {
    try {
      const { action } = req.body;

      if (action === 'start') {
        await simpleScheduler.start();
        res.status(200).json({
          success: true,
          message: 'Scheduler started',
          status: simpleScheduler.getStatus(),
        });
      } else if (action === 'stop') {
        simpleScheduler.stop();
        res.status(200).json({
          success: true,
          message: 'Scheduler stopped',
          status: simpleScheduler.getStatus(),
        });
      } else if (action === 'update') {
        await simpleScheduler.updateInterval();
        res.status(200).json({
          success: true,
          message: 'Scheduler interval updated',
          status: simpleScheduler.getStatus(),
        });
      } else if (action === 'force-update') {
        // Force restart regardless of whether interval changed
        if (simpleScheduler.getStatus().isRunning) {
          simpleScheduler.stop();
          await simpleScheduler.start();
        }
        res.status(200).json({
          success: true,
          message: 'Scheduler forcefully restarted with latest settings',
          status: simpleScheduler.getStatus(),
        });
      } else {
        res.status(400).json({
          success: false,
          error:
            'Invalid action. Use "start", "stop", "update", or "force-update"',
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
