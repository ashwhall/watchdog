// scripts/test-telegram.ts
import { telegramNotifier } from '../lib/telegram-notifier';
import type { Dog } from '../lib/schema';

async function testTelegram() {
  console.log('🧪 Testing Telegram notifications...\n');

  // Initialize the notifier
  const initialized = await telegramNotifier.init();

  if (!initialized) {
    console.log(
      '❌ Telegram notifier not configured. Run: npm run telegram:setup'
    );
    process.exit(1);
  }

  console.log('✅ Telegram notifier initialized');

  // Test connection
  console.log('⏳ Testing connection...');
  const connectionTest = await telegramNotifier.testConnection();

  if (!connectionTest) {
    console.log('❌ Connection test failed');
    process.exit(1);
  }

  console.log('✅ Connection test passed');

  // Test individual dog notification
  console.log('⏳ Testing individual dog notification...');
  const testDog: Dog = {
    id: 999,
    name: 'Test Buddy',
    breed: 'Golden Retriever',
    postUrl: 'https://example.com/test-dog',
    imageUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400',
    description:
      'This is a test notification for a beautiful golden retriever looking for a loving home.',
    scrapedAt: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const dogNotificationSuccess = await telegramNotifier.notifyNewDog(testDog);

  if (dogNotificationSuccess) {
    console.log('✅ Individual dog notification sent successfully');
  } else {
    console.log('❌ Individual dog notification failed');
  }

  // Test batch notification
  console.log('⏳ Testing batch notification...');
  const batchNotificationSuccess = await telegramNotifier.notifyBatchResults(3);

  if (batchNotificationSuccess) {
    console.log('✅ Batch notification sent successfully');
  } else {
    console.log('❌ Batch notification failed');
  }

  console.log('\n🎉 Telegram testing completed!');
  console.log('Check your Telegram chat to see the test messages.');
}

testTelegram().catch(console.error);
