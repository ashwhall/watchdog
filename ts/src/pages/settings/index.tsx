import { useState, useEffect } from 'react';
import Head from 'next/head';
import Layout from '../../components/Layout';

export default function Settings() {
  const [scrapeInterval, setScrapeInterval] = useState<string>('60'); // Default 60 minutes
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<string>('30'); // Default 30 seconds
  const [facebookEmail, setFacebookEmail] = useState<string>('');
  const [facebookPassword, setFacebookPassword] = useState<string>('');
  const [telegramBotToken, setTelegramBotToken] = useState<string>('');
  const [telegramChatId, setTelegramChatId] = useState<string>('');
  const [telegramNotificationsEnabled, setTelegramNotificationsEnabled] =
    useState<boolean>(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [testingTelegram, setTestingTelegram] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/settings');
      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }
      const settings = await response.json();
      setScrapeInterval(settings.scrapeInterval || '60');
      setAutoRefreshInterval(settings.autoRefreshInterval || '30');
      setFacebookEmail(settings.facebookEmail || '');
      setFacebookPassword(settings.facebookPassword || '');
      setTelegramBotToken(settings.telegramBotToken || '');
      setTelegramChatId(settings.telegramChatId || '');
      setTelegramNotificationsEnabled(
        settings.telegramNotificationsEnabled === 'true'
      );
    } catch (error) {
      console.error('Error fetching settings:', error);
      setMessage({ type: 'error', text: 'Failed to load settings' });
    } finally {
      setLoading(false);
    }
  };

  const validateFacebookCredentials = (email: string, password: string) => {
    const errors: string[] = [];

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push('Invalid email format');
    }

    if (password.trim() && password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }

    return errors;
  };

  const validateTelegramCredentials = (
    botToken: string,
    chatId: string,
    enabled: boolean
  ) => {
    const errors: string[] = [];

    if (enabled) {
      if (!botToken.trim()) {
        errors.push(
          'Bot token is required when Telegram notifications are enabled'
        );
      } else if (!/^\d+:[A-Za-z0-9_-]+$/.test(botToken.trim())) {
        errors.push(
          'Invalid bot token format (should be like 123456789:ABC-DEF...)'
        );
      }

      if (!chatId.trim()) {
        errors.push(
          'Chat ID is required when Telegram notifications are enabled'
        );
      } else if (!/^-?\d+$/.test(chatId.trim())) {
        errors.push('Invalid chat ID format (should be a number)');
      }
    }

    return errors;
  };

  const saveSettings = async () => {
    try {
      setSaving(true);
      setMessage(null);
      setValidationErrors([]);

      // Validate Facebook credentials if provided
      const fbValidationErrors = validateFacebookCredentials(
        facebookEmail,
        facebookPassword
      );

      // Validate Telegram credentials if enabled
      const telegramValidationErrors = validateTelegramCredentials(
        telegramBotToken,
        telegramChatId,
        telegramNotificationsEnabled
      );

      const allValidationErrors = [
        ...fbValidationErrors,
        ...telegramValidationErrors,
      ];

      if (allValidationErrors.length > 0) {
        setValidationErrors(allValidationErrors);
        setMessage({ type: 'error', text: 'Please fix validation errors' });
        return;
      }

      // Save scrape interval
      const scrapeResponse = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: 'scrapeInterval',
          value: scrapeInterval,
        }),
      });

      if (!scrapeResponse.ok) {
        throw new Error('Failed to save scrape interval');
      }

      // Save auto-refresh interval
      const refreshResponse = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: 'autoRefreshInterval',
          value: autoRefreshInterval,
        }),
      });

      if (!refreshResponse.ok) {
        throw new Error('Failed to save auto-refresh interval');
      }

      // Save Facebook email
      const facebookEmailResponse = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: 'facebookEmail',
          value: facebookEmail,
        }),
      });

      if (!facebookEmailResponse.ok) {
        throw new Error('Failed to save Facebook email');
      }

      // Save Facebook password (only if not empty)
      if (facebookPassword.trim()) {
        const facebookPasswordResponse = await fetch('/api/settings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            key: 'facebookPassword',
            value: facebookPassword,
          }),
        });

        if (!facebookPasswordResponse.ok) {
          throw new Error('Failed to save Facebook password');
        }
      }

      // Save Telegram settings
      const telegramEnabledResponse = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          key: 'telegramNotificationsEnabled',
          value: telegramNotificationsEnabled.toString(),
        }),
      });

      if (!telegramEnabledResponse.ok) {
        throw new Error('Failed to save Telegram notifications setting');
      }

      if (telegramNotificationsEnabled) {
        // Save Telegram bot token
        const telegramTokenResponse = await fetch('/api/settings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            key: 'telegramBotToken',
            value: telegramBotToken,
          }),
        });

        if (!telegramTokenResponse.ok) {
          throw new Error('Failed to save Telegram bot token');
        }

        // Save Telegram chat ID
        const telegramChatResponse = await fetch('/api/settings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            key: 'telegramChatId',
            value: telegramChatId,
          }),
        });

        if (!telegramChatResponse.ok) {
          throw new Error('Failed to save Telegram chat ID');
        }
      }

      setMessage({ type: 'success', text: 'Settings saved successfully!' });
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  const testTelegramConnection = async () => {
    try {
      setTestingTelegram(true);
      setMessage(null);

      // First validate the credentials
      const telegramValidationErrors = validateTelegramCredentials(
        telegramBotToken,
        telegramChatId,
        true
      );

      if (telegramValidationErrors.length > 0) {
        setValidationErrors(telegramValidationErrors);
        setMessage({
          type: 'error',
          text: 'Please fix validation errors before testing',
        });
        return;
      }

      // Save the Telegram settings first
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'telegramBotToken',
          value: telegramBotToken,
        }),
      });

      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'telegramChatId', value: telegramChatId }),
      });

      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'telegramNotificationsEnabled',
          value: 'true',
        }),
      });

      // Test the connection using our telegram test API
      const testResponse = await fetch('/api/telegram/test', {
        method: 'POST',
      });

      if (testResponse.ok) {
        setMessage({
          type: 'success',
          text: 'Telegram test message sent successfully! Check your chat.',
        });
      } else {
        const errorData = await testResponse
          .json()
          .catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || 'Test failed');
      }
    } catch (error) {
      console.error('Telegram test failed:', error);
      setMessage({
        type: 'error',
        text: `Telegram test failed: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      });
    } finally {
      setTestingTelegram(false);
    }
  };

  const formatIntervalText = (minutes: string) => {
    const mins = parseInt(minutes);
    if (mins < 60) {
      return `${mins} minute${mins === 1 ? '' : 's'}`;
    } else {
      const hours = Math.floor(mins / 60);
      const remainingMins = mins % 60;
      if (remainingMins === 0) {
        return `${hours} hour${hours === 1 ? '' : 's'}`;
      } else {
        return `${hours}h ${remainingMins}m`;
      }
    }
  };

  const formatSecondsText = (seconds: string) => {
    const secs = parseInt(seconds);
    if (secs < 60) {
      return `${secs} second${secs === 1 ? '' : 's'}`;
    } else {
      const minutes = Math.floor(secs / 60);
      const remainingSecs = secs % 60;
      if (remainingSecs === 0) {
        return `${minutes} minute${minutes === 1 ? '' : 's'}`;
      } else {
        return `${minutes}m ${remainingSecs}s`;
      }
    }
  };

  if (loading) {
    return (
      <>
        <Head>
          <title>Watchdog - Settings</title>
        </Head>
        <Layout>
          <div className="text-center py-16">
            <div className="relative mx-auto w-32 h-32 mb-8">
              {/* Rainbow spinning loader */}
              <div
                className="absolute inset-0 rounded-full border-4 border-transparent bg-gradient-to-r from-rainbow-red via-rainbow-blue to-rainbow-purple animate-spin"
                style={{
                  background:
                    'conic-gradient(from 0deg, #ff6b6b, #ffa726, #ffeb3b, #66bb6a, #42a5f5, #7e57c2, #ab47bc, #ff6b6b)',
                  mask: 'radial-gradient(circle at center, transparent 50%, black 50%)',
                  WebkitMask:
                    'radial-gradient(circle at center, transparent 50%, black 50%)',
                }}
              ></div>
              <div className="absolute inset-2 bg-dark-bg rounded-full"></div>
              <div className="absolute inset-0 flex items-center justify-center text-4xl">
                ⚙️
              </div>
            </div>
            <p className="text-xl rainbow-text font-bold">
              Loading settings...
            </p>
          </div>
        </Layout>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Watchdog - Settings</title>
      </Head>
      <Layout>
        <div className="max-w-2xl mx-auto">
          <div className="glass rounded-3xl p-6 mb-8">
            <h1 className="text-3xl font-bold text-text-primary">
              ⚙️ Settings
            </h1>
            <p className="text-text-secondary text-lg">
              Configure your dog watchdog preferences
            </p>
          </div>

          {message && (
            <div
              className={`mb-6 p-4 rounded-lg border ${
                message.type === 'success'
                  ? 'bg-dark-elevated border-rainbow-green text-rainbow-green'
                  : 'bg-dark-elevated border-rainbow-red text-rainbow-red'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span>{message.type === 'success' ? '✅' : '❌'}</span>
                <span className="font-medium">{message.text}</span>
              </div>
            </div>
          )}

          {validationErrors.length > 0 && (
            <div className="mb-6 p-4 rounded-lg bg-dark-elevated border border-rainbow-red">
              <h4 className="text-sm font-bold text-rainbow-red mb-3 flex items-center space-x-2">
                <span>⚠️</span>
                <span>Validation Errors:</span>
              </h4>
              <ul className="space-y-1 text-sm text-dark-text-secondary">
                {validationErrors.map((error, index) => (
                  <li key={index} className="flex items-center space-x-2">
                    <span className="text-rainbow-red">•</span>
                    <span>{error}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="glass rounded-3xl p-8">
            <h2 className="text-xl font-bold text-text-primary mb-6 flex items-center space-x-2">
              <span>🔧</span>
              <span>Application Settings</span>
            </h2>

            <div className="space-y-6">
              {/* Scraping Configuration */}
              <div>
                <h3 className="text-md font-medium text-white mb-3">
                  Scraping Configuration
                </h3>
                <div>
                  <label
                    htmlFor="scrapeInterval"
                    className="block text-sm font-medium text-dark-text-primary mb-2"
                  >
                    Scrape Interval
                  </label>
                  <div className="flex items-center space-x-4">
                    <select
                      id="scrapeInterval"
                      value={scrapeInterval}
                      onChange={(e) => setScrapeInterval(e.target.value)}
                      className="block w-48 px-3 py-2 bg-dark-elevated border border-dark-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-rainbow-blue focus:border-rainbow-blue"
                    >
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="60">1 hour</option>
                      <option value="120">2 hours</option>
                      <option value="240">4 hours</option>
                      <option value="480">8 hours</option>
                      <option value="720">12 hours</option>
                      <option value="1440">24 hours</option>
                    </select>
                    <span className="text-sm text-dark-text-secondary">
                      Currently set to {formatIntervalText(scrapeInterval)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-dark-text-secondary">
                    How often the system should check for new dogs
                  </p>
                </div>
              </div>

              {/* Auto-refresh Configuration */}
              <div className="border-t border-dark-border pt-6">
                <h3 className="text-md font-medium text-white mb-3">
                  Dashboard Settings
                </h3>
                <div>
                  <label
                    htmlFor="autoRefreshInterval"
                    className="block text-sm font-medium text-dark-text-primary mb-2"
                  >
                    Auto-refresh Interval
                  </label>
                  <div className="flex items-center space-x-4">
                    <select
                      id="autoRefreshInterval"
                      value={autoRefreshInterval}
                      onChange={(e) => setAutoRefreshInterval(e.target.value)}
                      className="block w-48 px-3 py-2 bg-dark-elevated border border-dark-border rounded-md text-white focus:outline-none focus:ring-2 focus:ring-rainbow-blue focus:border-rainbow-blue"
                    >
                      <option value="10">10 seconds</option>
                      <option value="15">15 seconds</option>
                      <option value="30">30 seconds</option>
                      <option value="60">1 minute</option>
                      <option value="120">2 minutes</option>
                      <option value="300">5 minutes</option>
                      <option value="600">10 minutes</option>
                      <option value="0">Disabled</option>
                    </select>
                    <span className="text-sm text-dark-text-secondary">
                      Currently set to{' '}
                      {autoRefreshInterval === '0'
                        ? 'Disabled'
                        : formatSecondsText(autoRefreshInterval)}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-dark-text-secondary">
                    How often the dashboard should automatically refresh to show
                    new dogs
                  </p>
                </div>
              </div>

              {/* Facebook Credentials Configuration */}
              <div className="border-t border-dark-border pt-6">
                <h3 className="text-md font-medium text-white mb-3">
                  Facebook Credentials
                </h3>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="facebookEmail"
                      className="block text-sm font-medium text-dark-text-primary mb-2"
                    >
                      Facebook Email
                    </label>
                    <input
                      type="email"
                      id="facebookEmail"
                      value={facebookEmail}
                      onChange={(e) => setFacebookEmail(e.target.value)}
                      placeholder="Enter your Facebook email"
                      className="block w-full px-3 py-2 bg-dark-elevated border border-dark-border rounded-md text-white placeholder-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-rainbow-blue focus:border-rainbow-blue"
                    />
                    <p className="mt-1 text-sm text-dark-text-secondary">
                      Email address for your Facebook account
                    </p>
                  </div>
                  <div>
                    <label
                      htmlFor="facebookPassword"
                      className="block text-sm font-medium text-dark-text-primary mb-2"
                    >
                      Facebook Password
                    </label>
                    <input
                      type="password"
                      id="facebookPassword"
                      value={facebookPassword}
                      onChange={(e) => setFacebookPassword(e.target.value)}
                      placeholder="Enter your Facebook password"
                      className="block w-full px-3 py-2 bg-dark-elevated border border-dark-border rounded-md text-white placeholder-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-rainbow-blue focus:border-rainbow-blue"
                    />
                    <p className="mt-1 text-sm text-dark-text-secondary">
                      Password is encrypted and stored securely. Leave blank to
                      keep existing password.
                    </p>
                  </div>
                </div>
              </div>

              {/* Telegram Notifications Configuration */}
              <div className="border-t border-dark-border pt-6">
                <h3 className="text-md font-medium text-white mb-3">
                  Telegram Notifications
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={telegramNotificationsEnabled}
                        onChange={(e) =>
                          setTelegramNotificationsEnabled(e.target.checked)
                        }
                        className="h-4 w-4 text-rainbow-blue focus:ring-rainbow-blue border-dark-border rounded bg-dark-elevated"
                      />
                      <span className="ml-2 text-sm font-medium text-dark-text-primary">
                        Enable Telegram notifications for new dogs
                      </span>
                    </label>
                    <p className="mt-1 text-sm text-dark-text-secondary">
                      Get instant notifications when new dogs are found during
                      scraping
                    </p>
                  </div>

                  {telegramNotificationsEnabled && (
                    <>
                      <div>
                        <label
                          htmlFor="telegramBotToken"
                          className="block text-sm font-medium text-dark-text-primary mb-2"
                        >
                          Bot Token
                        </label>
                        <input
                          type="password"
                          id="telegramBotToken"
                          value={telegramBotToken}
                          onChange={(e) => setTelegramBotToken(e.target.value)}
                          placeholder="123456789:ABC-DEF1234ghijklmnop..."
                          className="block w-full px-3 py-2 bg-dark-elevated border border-dark-border rounded-md text-white placeholder-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-rainbow-blue focus:border-rainbow-blue"
                        />
                        <p className="mt-1 text-sm text-dark-text-secondary">
                          Get this from @BotFather on Telegram.
                          <a
                            href="https://core.telegram.org/bots#creating-a-new-bot"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-rainbow-blue hover:text-rainbow-cyan ml-1 transition-colors"
                          >
                            Learn how →
                          </a>
                        </p>
                      </div>
                      <div>
                        <label
                          htmlFor="telegramChatId"
                          className="block text-sm font-medium text-dark-text-primary mb-2"
                        >
                          Chat ID
                        </label>
                        <input
                          type="text"
                          id="telegramChatId"
                          value={telegramChatId}
                          onChange={(e) => setTelegramChatId(e.target.value)}
                          placeholder="123456789 or -123456789 for groups"
                          className="block w-full px-3 py-2 bg-dark-elevated border border-dark-border rounded-md text-white placeholder-dark-text-secondary focus:outline-none focus:ring-2 focus:ring-rainbow-blue focus:border-rainbow-blue"
                        />
                        <p className="mt-1 text-sm text-dark-text-secondary">
                          Your personal chat ID or group chat ID. Send a message
                          to your bot first, then visit:
                          <code className="bg-dark-elevated px-1 rounded text-xs text-rainbow-cyan ml-1">
                            https://api.telegram.org/bot&lt;YOUR_BOT_TOKEN&gt;/getUpdates
                          </code>
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-dark-border flex flex-col sm:flex-row gap-3">
              <button
                onClick={saveSettings}
                disabled={saving}
                className="group relative px-6 py-3 bg-gradient-to-r from-rainbow-blue to-rainbow-purple text-white rounded-lg hover:from-rainbow-purple hover:to-rainbow-pink disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transform transition-all duration-300 hover:scale-105 active:scale-95"
              >
                {saving ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  'Save Settings'
                )}
              </button>

              {telegramNotificationsEnabled &&
                telegramBotToken &&
                telegramChatId && (
                  <button
                    onClick={testTelegramConnection}
                    disabled={testingTelegram || saving}
                    className="group relative px-6 py-3 bg-gradient-to-r from-rainbow-green to-rainbow-cyan text-white rounded-lg hover:from-rainbow-cyan hover:to-rainbow-blue disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transform transition-all duration-300 hover:scale-105 active:scale-95"
                  >
                    {testingTelegram ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Testing...
                      </>
                    ) : (
                      '🧪 Test Telegram'
                    )}
                  </button>
                )}
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}
