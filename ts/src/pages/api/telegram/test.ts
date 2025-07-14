import { NextApiRequest, NextApiResponse } from 'next';
import { telegramNotifier } from '../../../../lib/telegram-notifier';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Initialize and test the Telegram connection
    const initialized = await telegramNotifier.init();

    if (!initialized) {
      return res.status(400).json({
        error:
          'Telegram notifier could not be initialized. Please check your bot token and chat ID.',
      });
    }

    const testSuccess = await telegramNotifier.testConnection();

    if (testSuccess) {
      return res.status(200).json({
        success: true,
        message: 'Telegram test message sent successfully!',
      });
    } else {
      return res.status(400).json({
        error: 'Failed to send test message. Please check your configuration.',
      });
    }
  } catch (error) {
    console.error('Telegram test API error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}
