// scripts/debug-facebook-login.ts
import { createBrowser } from '../lib/browser-utils';
import { setupAntiDetection } from '../lib/browser-utils';

async function debugFacebookLogin() {
  console.log('🔍 Debugging Facebook mobile login page...');

  const browser = await createBrowser({ headless: false });
  const page = await browser.newPage();

  try {
    await setupAntiDetection(page);

    // Navigate to Facebook mobile login
    console.log('📱 Navigating to Facebook mobile...');
    await page.goto('https://m.facebook.com', {
      waitUntil: 'domcontentloaded',
      timeout: 15000,
    });

    // Wait a moment for the page to load
    await new Promise((resolve) => setTimeout(resolve, 3000));

    // Take a screenshot
    await page.screenshot({
      path: 'facebook-mobile-debug.png',
      fullPage: true,
    });
    console.log('📸 Screenshot saved as facebook-mobile-debug.png');

    // Get all form elements and their attributes
    const formElements = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input'));
      const buttons = Array.from(document.querySelectorAll('button'));
      const links = Array.from(document.querySelectorAll('a'));

      return {
        inputs: inputs.map((input) => ({
          id: input.id,
          name: input.name,
          type: input.type,
          placeholder: input.placeholder,
          className: input.className,
        })),
        buttons: buttons.map((button) => ({
          id: button.id,
          className: button.className,
          innerText: button.innerText,
          type: button.type,
        })),
        loginLinks: links
          .filter(
            (link) =>
              link.innerText.toLowerCase().includes('log') ||
              link.innerText.toLowerCase().includes('sign')
          )
          .map((link) => ({
            href: link.href,
            innerText: link.innerText,
            className: link.className,
          })),
      };
    });

    console.log('📋 Email inputs found:');
    const emailInputs = formElements.inputs.filter(
      (input) =>
        input.type === 'email' ||
        input.id.includes('email') ||
        input.name.includes('email') ||
        input.placeholder?.toLowerCase().includes('email')
    );
    console.log(emailInputs);

    console.log('📋 Password inputs found:');
    const passwordInputs = formElements.inputs.filter(
      (input) =>
        input.type === 'password' ||
        input.id.includes('password') ||
        input.name.includes('password') ||
        input.placeholder?.toLowerCase().includes('password')
    );
    console.log(passwordInputs);

    console.log('📋 Login buttons found:');
    const loginButtons = formElements.buttons.filter(
      (button) =>
        button.innerText.toLowerCase().includes('log') ||
        button.innerText.toLowerCase().includes('sign') ||
        button.type === 'submit'
    );
    console.log(loginButtons);

    console.log('📋 Login links found:');
    console.log(formElements.loginLinks);

    // Check for common Facebook mobile login selectors
    const selectors = [
      '#m_login_email',
      '#m_login_password',
      '._56bu',
      '[name="login"]',
      '[type="submit"]',
      'button[type="submit"]',
      '.touchable',
      '._54k8',
      '._56bw',
      '._9ai-',
    ];

    console.log('📋 Testing common selectors:');
    for (const selector of selectors) {
      try {
        const element = await page.$(selector);
        if (element) {
          const text = await page.evaluate((el) => {
            const htmlEl = el as HTMLElement;
            const inputEl = el as HTMLInputElement;
            return (
              htmlEl.innerText || inputEl.value || inputEl.placeholder || ''
            );
          }, element);
          const className = await page.evaluate((el) => el.className, element);
          console.log(`✅ ${selector}: "${text}" (class: ${className})`);
        } else {
          console.log(`❌ ${selector}: not found`);
        }
      } catch (error) {
        console.log(`❌ ${selector}: error - ${error}`);
      }
    }

    // Keep browser open for manual inspection
    console.log(
      '🔍 Browser will stay open for manual inspection. Press Ctrl+C to close.'
    );
    await new Promise(() => {}); // Keep alive
  } catch (error) {
    console.error('❌ Debug failed:', error);
  } finally {
    // Don't auto-close for debugging
    // await browser.close();
  }
}

// Run if called directly
if (require.main === module) {
  debugFacebookLogin().catch(console.error);
}

export { debugFacebookLogin };
