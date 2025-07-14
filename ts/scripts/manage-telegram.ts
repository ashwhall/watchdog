// scripts/manage-telegram.ts
import { telegramNotifier } from '../lib/telegram-notifier';
import {
  getTelegramCredentials,
  setTelegramBotToken,
  setTelegramChatId,
  setTelegramNotificationsEnabled,
} from '../lib/settings';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function showCurrentSettings() {
  console.log('\n📋 Current Telegram Settings:');
  try {
    const { botToken, chatId, notificationsEnabled } =
      await getTelegramCredentials();

    console.log(
      `  Notifications: ${notificationsEnabled ? '✅ Enabled' : '❌ Disabled'}`
    );
    console.log(
      `  Bot Token: ${botToken ? '✅ Configured (hidden)' : '❌ Not set'}`
    );
    console.log(`  Chat ID: ${chatId || '❌ Not set'}`);

    if (botToken && chatId && notificationsEnabled) {
      console.log('\n🔍 Testing connection...');
      const initialized = await telegramNotifier.init();
      if (initialized) {
        console.log('✅ Connection successful');
      } else {
        console.log('❌ Connection failed');
      }
    }
  } catch (error) {
    console.error('❌ Error reading settings:', error);
  }
}

async function updateBotToken() {
  const newToken = await question(
    'Enter new bot token (or press Enter to skip): '
  );
  if (newToken.trim()) {
    await setTelegramBotToken(newToken.trim());
    console.log('✅ Bot token updated');
  }
}

async function updateChatId() {
  console.log('\nTo find your chat ID:');
  console.log('1. Send a message to your bot');
  console.log(
    '2. Visit: https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates'
  );
  console.log('3. Look for the "id" field in the "chat" object\n');

  const newChatId = await question(
    'Enter new chat ID (or press Enter to skip): '
  );
  if (newChatId.trim()) {
    await setTelegramChatId(newChatId.trim());
    console.log('✅ Chat ID updated');
  }
}

async function toggleNotifications() {
  const { notificationsEnabled } = await getTelegramCredentials();
  const newState = !notificationsEnabled;

  await setTelegramNotificationsEnabled(newState);
  console.log(`✅ Notifications ${newState ? 'enabled' : 'disabled'}`);
}

async function testConnection() {
  console.log('⏳ Testing Telegram connection...');
  try {
    const initialized = await telegramNotifier.init();
    if (!initialized) {
      console.log('❌ Failed to initialize. Check your configuration.');
      return;
    }

    const success = await telegramNotifier.testConnection();
    if (success) {
      console.log('✅ Test message sent! Check your Telegram chat.');
    } else {
      console.log('❌ Failed to send test message.');
    }
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

async function resetSettings() {
  const confirm = await question(
    'Are you sure you want to reset all Telegram settings? (yes/no): '
  );
  if (confirm.toLowerCase() === 'yes') {
    try {
      await setTelegramNotificationsEnabled(false);
      await setTelegramBotToken('');
      await setTelegramChatId('');
      console.log('✅ All Telegram settings reset');
    } catch (error) {
      console.error('❌ Failed to reset settings:', error);
    }
  }
}

async function manageTelegram() {
  console.log('🤖 Telegram Settings Manager\n');

  while (true) {
    await showCurrentSettings();

    console.log('\n🛠️  Available actions:');
    console.log('1. Update bot token');
    console.log('2. Update chat ID');
    console.log('3. Toggle notifications');
    console.log('4. Test connection');
    console.log('5. Reset all settings');
    console.log('6. Exit');

    const choice = await question('\nSelect an option (1-6): ');

    switch (choice) {
      case '1':
        await updateBotToken();
        break;
      case '2':
        await updateChatId();
        break;
      case '3':
        await toggleNotifications();
        break;
      case '4':
        await testConnection();
        break;
      case '5':
        await resetSettings();
        break;
      case '6':
        console.log('👋 Goodbye!');
        rl.close();
        return;
      default:
        console.log('❌ Invalid option. Please try again.');
    }

    console.log('\n' + '─'.repeat(50));
  }
}

manageTelegram().catch(console.error);
