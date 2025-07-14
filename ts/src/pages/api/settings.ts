import { NextApiRequest, NextApiResponse } from 'next';
import { getSetting, setSetting, getAllSettings } from '../../../lib/db';
import {
  getFacebookEmail,
  getFacebookPassword,
  setFacebookEmail,
  setFacebookPassword,
  getTelegramBotToken,
  getTelegramChatId,
  getTelegramNotificationsEnabled,
  setTelegramBotToken,
  setTelegramChatId,
  setTelegramNotificationsEnabled,
} from '../../../lib/settings';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    if (req.method === 'GET') {
      const { key } = req.query;

      if (key) {
        const value = await getSetting(key as string);
        return res.status(200).json({ key, value });
      } else {
        const allSettings = await getAllSettings();
        const settingsObject = allSettings.reduce((acc, setting) => {
          acc[setting.key] = setting.value;
          return acc;
        }, {} as Record<string, string>);

        // Add decrypted Facebook credentials to the response
        settingsObject.facebookEmail = await getFacebookEmail();
        settingsObject.facebookPassword = await getFacebookPassword();

        // Add Telegram settings to the response
        settingsObject.telegramBotToken = await getTelegramBotToken();
        settingsObject.telegramChatId = await getTelegramChatId();
        settingsObject.telegramNotificationsEnabled = (
          await getTelegramNotificationsEnabled()
        ).toString();

        return res.status(200).json(settingsObject);
      }
    }

    if (req.method === 'POST') {
      const { key, value } = req.body;

      if (!key || value === undefined) {
        return res.status(400).json({ error: 'Key and value are required' });
      }

      // Handle Facebook credentials with encryption
      if (key === 'facebookEmail') {
        await setFacebookEmail(value);
      } else if (key === 'facebookPassword') {
        await setFacebookPassword(value);
      } else if (key === 'telegramBotToken') {
        await setTelegramBotToken(value);
      } else if (key === 'telegramChatId') {
        await setTelegramChatId(value);
      } else if (key === 'telegramNotificationsEnabled') {
        await setTelegramNotificationsEnabled(value === 'true');
      } else {
        await setSetting(key, value);
      }

      return res.status(200).json({ key, value });
    }

    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  } catch (error) {
    console.error('Settings API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
