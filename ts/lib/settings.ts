import { getSetting, setSetting } from './db';
import { createCipher, createDecipher } from 'crypto';

// Default values for settings
const DEFAULT_SETTINGS = {
  scrapeInterval: '60', // minutes
  autoRefreshInterval: '30', // seconds
  facebookEmail: '',
  facebookPassword: '', // This will be encrypted
  telegramBotToken: '', // This will be encrypted
  telegramChatId: '',
  telegramNotificationsEnabled: 'false',
} as const;

// Encryption helper functions
const ENCRYPTION_KEY =
  process.env.ENCRYPTION_KEY || 'change-this-key-in-production';

function encryptPassword(password: string): string {
  const cipher = createCipher('aes-256-cbc', ENCRYPTION_KEY);
  let encrypted = cipher.update(password, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}

function decryptPassword(encryptedPassword: string): string {
  try {
    const decipher = createDecipher('aes-256-cbc', ENCRYPTION_KEY);
    let decrypted = decipher.update(encryptedPassword, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch {
    // If decryption fails, return empty string
    return '';
  }
}

// Helper functions for specific settings
export async function getScrapeInterval(): Promise<number> {
  const value = await getSetting('scrapeInterval');
  return parseInt(value || DEFAULT_SETTINGS.scrapeInterval);
}

export async function setScrapeInterval(minutes: number): Promise<void> {
  await setSetting('scrapeInterval', minutes.toString());
}

export async function getAutoRefreshInterval(): Promise<number> {
  const value = await getSetting('autoRefreshInterval');
  return parseInt(value || DEFAULT_SETTINGS.autoRefreshInterval);
}

export async function setAutoRefreshInterval(seconds: number): Promise<void> {
  await setSetting('autoRefreshInterval', seconds.toString());
}

// Facebook credentials functions
export async function getFacebookEmail(): Promise<string> {
  const value = await getSetting('facebookEmail');
  return value || DEFAULT_SETTINGS.facebookEmail;
}

export async function setFacebookEmail(email: string): Promise<void> {
  await setSetting('facebookEmail', email);
}

export async function getFacebookPassword(): Promise<string> {
  const encryptedPassword = await getSetting('facebookPassword');
  if (!encryptedPassword) {
    return DEFAULT_SETTINGS.facebookPassword;
  }
  return decryptPassword(encryptedPassword);
}

export async function setFacebookPassword(password: string): Promise<void> {
  const encryptedPassword = encryptPassword(password);
  await setSetting('facebookPassword', encryptedPassword);
}

export async function getFacebookCredentials(): Promise<{
  email: string;
  password: string;
}> {
  const email = await getFacebookEmail();
  const password = await getFacebookPassword();
  return { email, password };
}

export async function setFacebookCredentials(
  email: string,
  password: string
): Promise<void> {
  await setFacebookEmail(email);
  await setFacebookPassword(password);
}

// Telegram settings functions
export async function getTelegramBotToken(): Promise<string> {
  const encryptedToken = await getSetting('telegramBotToken');
  if (!encryptedToken) {
    return DEFAULT_SETTINGS.telegramBotToken;
  }
  return decryptPassword(encryptedToken);
}

export async function setTelegramBotToken(token: string): Promise<void> {
  const encryptedToken = encryptPassword(token);
  await setSetting('telegramBotToken', encryptedToken);
}

export async function getTelegramChatId(): Promise<string> {
  const value = await getSetting('telegramChatId');
  return value || DEFAULT_SETTINGS.telegramChatId;
}

export async function setTelegramChatId(chatId: string): Promise<void> {
  await setSetting('telegramChatId', chatId);
}

export async function getTelegramNotificationsEnabled(): Promise<boolean> {
  const value = await getSetting('telegramNotificationsEnabled');
  return (value || DEFAULT_SETTINGS.telegramNotificationsEnabled) === 'true';
}

export async function setTelegramNotificationsEnabled(
  enabled: boolean
): Promise<void> {
  await setSetting('telegramNotificationsEnabled', enabled.toString());
}

export async function getTelegramCredentials(): Promise<{
  botToken: string;
  chatId: string;
  notificationsEnabled: boolean;
}> {
  const botToken = await getTelegramBotToken();
  const chatId = await getTelegramChatId();
  const notificationsEnabled = await getTelegramNotificationsEnabled();
  return { botToken, chatId, notificationsEnabled };
}

export async function setTelegramCredentials(
  botToken: string,
  chatId: string,
  notificationsEnabled: boolean = true
): Promise<void> {
  await setTelegramBotToken(botToken);
  await setTelegramChatId(chatId);
  await setTelegramNotificationsEnabled(notificationsEnabled);
}

// Generic helper for getting any setting with fallback
export async function getSettingWithDefault<
  T extends keyof typeof DEFAULT_SETTINGS
>(key: T): Promise<string> {
  const value = await getSetting(key);
  return value || DEFAULT_SETTINGS[key];
}

// Helper to get all settings as an object
export async function getAllSettingsFormatted() {
  const scrapeInterval = await getScrapeInterval();
  const autoRefreshInterval = await getAutoRefreshInterval();
  const facebookEmail = await getFacebookEmail();
  const facebookPassword = await getFacebookPassword();
  const telegramBotToken = await getTelegramBotToken();
  const telegramChatId = await getTelegramChatId();
  const telegramNotificationsEnabled = await getTelegramNotificationsEnabled();

  return {
    scrapeInterval,
    scrapeIntervalText: formatInterval(scrapeInterval),
    autoRefreshInterval,
    autoRefreshIntervalText: formatSeconds(autoRefreshInterval),
    facebookEmail,
    facebookPassword,
    telegramBotToken,
    telegramChatId,
    telegramNotificationsEnabled,
  };
}

function formatInterval(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} minute${minutes === 1 ? '' : 's'}`;
  } else {
    const hours = Math.floor(minutes / 60);
    const remainingMins = minutes % 60;
    if (remainingMins === 0) {
      return `${hours} hour${hours === 1 ? '' : 's'}`;
    } else {
      return `${hours}h ${remainingMins}m`;
    }
  }
}

function formatSeconds(seconds: number): string {
  if (seconds < 60) {
    return `${seconds} second${seconds === 1 ? '' : 's'}`;
  } else {
    const minutes = Math.floor(seconds / 60);
    const remainingSecs = seconds % 60;
    if (remainingSecs === 0) {
      return `${minutes} minute${minutes === 1 ? '' : 's'}`;
    } else {
      return `${minutes}m ${remainingSecs}s`;
    }
  }
}

// Utility function for scraping scripts to check if Facebook credentials are configured
export async function areFacebookCredentialsConfigured(): Promise<boolean> {
  const { email, password } = await getFacebookCredentials();
  return email.trim() !== '' && password.trim() !== '';
}

// Utility function to validate Facebook credentials format
export function validateFacebookCredentials(
  email: string,
  password: string
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!email || email.trim() === '') {
    errors.push('Email is required');
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push('Invalid email format');
  }

  if (!password || password.trim() === '') {
    errors.push('Password is required');
  } else if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Utility function to check if Telegram is configured
export async function isTelegramConfigured(): Promise<boolean> {
  const { botToken, chatId, notificationsEnabled } =
    await getTelegramCredentials();
  return notificationsEnabled && botToken.trim() !== '' && chatId.trim() !== '';
}

// Utility function to validate Telegram credentials format
export function validateTelegramCredentials(
  botToken: string,
  chatId: string
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!botToken || botToken.trim() === '') {
    errors.push('Bot token is required');
  } else if (!/^\d+:[A-Za-z0-9_-]+$/.test(botToken.trim())) {
    errors.push(
      'Invalid bot token format (should be like 123456789:ABC-DEF...)'
    );
  }

  if (!chatId || chatId.trim() === '') {
    errors.push('Chat ID is required');
  } else if (!/^-?\d+$/.test(chatId.trim())) {
    errors.push('Invalid chat ID format (should be a number)');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
