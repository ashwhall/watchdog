// scripts/setup-telegram.ts
import { telegramNotifier } from '../lib/telegram-notifier';
import {
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

async function setupTelegram() {
  console.log('🤖 Telegram Bot Setup for Watchdog\n');

  console.log('First, you need to create a Telegram bot:');
  console.log('1. Message @BotFather on Telegram');
  console.log('2. Use /newbot command');
  console.log('3. Follow the instructions to create your bot');
  console.log('4. Copy the bot token\n');

  const botToken = await question('Enter your Telegram bot token: ');

  if (!botToken.trim()) {
    console.log('❌ Bot token is required');
    process.exit(1);
  }

  console.log('\nNext, you need to get your chat ID:');
  console.log('1. Start a conversation with your bot on Telegram');
  console.log('2. Send any message to your bot');
  console.log(
    '3. Visit: https://api.telegram.org/bot' + botToken + '/getUpdates'
  );
  console.log('4. Look for the "chat" object and copy the "id" value');
  console.log(
    '   (It will be a number like 123456789 or -123456789 for groups)\n'
  );

  const chatId = await question('Enter your chat ID: ');

  if (!chatId.trim()) {
    console.log('❌ Chat ID is required');
    process.exit(1);
  }

  try {
    console.log('\n⏳ Saving configuration...');
    await setTelegramBotToken(botToken.trim());
    await setTelegramChatId(chatId.trim());
    await setTelegramNotificationsEnabled(true);

    console.log('✅ Configuration saved!');

    console.log('\n⏳ Testing connection...');
    const initialized = await telegramNotifier.init();

    if (initialized) {
      const testSuccess = await telegramNotifier.testConnection();
      if (testSuccess) {
        console.log('✅ Telegram bot is working correctly!');
        console.log(
          '🐕 You will now receive notifications when new dogs are found.'
        );
      } else {
        console.log('❌ Test message failed. Please check your configuration.');
      }
    } else {
      console.log(
        '❌ Failed to initialize bot. Please check your configuration.'
      );
    }
  } catch (error) {
    console.error('❌ Error setting up Telegram:', error);
    process.exit(1);
  }

  rl.close();
}

setupTelegram().catch(console.error);
