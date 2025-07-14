import puppeteer from 'puppeteer';

async function testQuietPuppeteer() {
  console.log('🧪 Testing Puppeteer with error suppression...');

  const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;

  try {
    console.log('🚀 Launching browser with quiet mode...');
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: executablePath,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-dbus',
        '--disable-notifications',
        '--disable-background-mode',
        '--disable-logging',
        '--silent',
        '--log-level=3',
        '--disable-component-extensions-with-background-pages',
        '--disable-crash-reporter',
        '--disable-system-sounds',
        '--remote-debugging-port=9223',
      ],
      timeout: 60000,
      dumpio: false, // This should suppress Chrome's stderr output
    });

    console.log('✅ Browser launched successfully (should be quiet)!');

    const page = await browser.newPage();
    await page.goto('https://www.google.com', {
      waitUntil: 'domcontentloaded',
      timeout: 10000,
    });
    console.log('✅ Page loaded successfully!');

    await page.close();
    await browser.close();
    console.log('✅ Browser closed successfully!');

    console.log('🎉 Quiet Puppeteer test completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error);
    process.exit(1);
  }
}

testQuietPuppeteer();
