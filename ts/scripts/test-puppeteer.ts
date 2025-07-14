import puppeteer from 'puppeteer';
import fs from 'fs';

async function testPuppeteer() {
  console.log('🧪 Testing Puppeteer setup...');

  // Show environment variables
  console.log('🔍 Environment variables:');
  console.log(
    '  PUPPETEER_EXECUTABLE_PATH:',
    process.env.PUPPETEER_EXECUTABLE_PATH
  );
  console.log('  CHROME_BIN:', process.env.CHROME_BIN);

  // Test Chrome executable paths
  const possiblePaths = [
    '/usr/bin/google-chrome-stable',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/snap/bin/chromium',
  ];

  console.log('🔍 Checking Chrome/Chromium executables:');
  for (const path of possiblePaths) {
    const exists = fs.existsSync(path);
    console.log(`  ${path}: ${exists ? '✅ Found' : '❌ Not found'}`);
  }

  try {
    const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH;

    console.log('🚀 Attempting to launch browser...');
    const browser = await puppeteer.launch({
      headless: true,
      executablePath: executablePath,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--remote-debugging-port=9222',
      ],
      timeout: 60000,
    });

    console.log('✅ Browser launched successfully!');

    const page = await browser.newPage();
    await page.goto('about:blank');
    console.log('✅ Page created and navigated successfully!');

    await browser.close();
    console.log('✅ Browser closed successfully!');

    console.log('🎉 Puppeteer test completed successfully!');
  } catch (error) {
    console.error('❌ Puppeteer test failed:', error);
    process.exit(1);
  }
}

testPuppeteer();
