// scripts/debug-site.ts
import puppeteer from 'puppeteer';

async function debugSite(url: string) {
  console.log(`🔍 Debugging site: ${url}`);

  const browser = await puppeteer.launch({ headless: false }); // Visual mode for debugging
  const page = await browser.newPage();

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 15000 });
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const info = await page.evaluate(() => {
      const result = {
        title: document.title,
        url: window.location.href,
        bodyText: document.body?.innerText.substring(0, 200) || 'No body',

        // Count elements
        totalLinks: document.querySelectorAll('a').length,
        totalImages: document.querySelectorAll('img').length,
        totalForms: document.querySelectorAll('form').length,
        totalButtons: document.querySelectorAll('button').length,

        // Find potential pet/dog related elements
        petElements: [] as string[],
        searchElements: [] as string[],
        imageInfo: [] as Array<{ src: string; alt: string; parent: string }>,
      };

      // Look for pet-related class names and IDs
      const allElements = document.querySelectorAll('*');
      allElements.forEach((el) => {
        const className = el.className;
        const id = el.id;
        const tagName = el.tagName.toLowerCase();

        if (
          typeof className === 'string' &&
          (className.includes('pet') ||
            className.includes('dog') ||
            className.includes('animal') ||
            className.includes('adopt'))
        ) {
          result.petElements.push(`${tagName}.${className}`);
        }

        if (
          typeof id === 'string' &&
          (id.includes('pet') ||
            id.includes('dog') ||
            id.includes('animal') ||
            id.includes('adopt') ||
            id.includes('search'))
        ) {
          result.petElements.push(`${tagName}#${id}`);
        }

        if (
          typeof className === 'string' &&
          (className.includes('search') ||
            className.includes('browse') ||
            className.includes('filter'))
        ) {
          result.searchElements.push(`${tagName}.${className}`);
        }
      });

      // Get info about first 10 images
      const images = document.querySelectorAll('img');
      for (let i = 0; i < Math.min(10, images.length); i++) {
        const img = images[i] as HTMLImageElement;
        const parent = img.parentElement?.tagName.toLowerCase() || 'unknown';
        result.imageInfo.push({
          src: img.src.substring(0, 100),
          alt: img.alt || 'no alt',
          parent: parent,
        });
      }

      return result;
    });

    console.log('\n📊 Site Analysis:');
    console.log(`Title: ${info.title}`);
    console.log(`URL: ${info.url}`);
    console.log(`Body preview: ${info.bodyText}...`);
    console.log(`\n📈 Element counts:`);
    console.log(`  Links: ${info.totalLinks}`);
    console.log(`  Images: ${info.totalImages}`);
    console.log(`  Forms: ${info.totalForms}`);
    console.log(`  Buttons: ${info.totalButtons}`);

    if (info.petElements.length > 0) {
      console.log(`\n🐕 Pet-related elements found:`);
      info.petElements.slice(0, 10).forEach((el) => console.log(`  ${el}`));
      if (info.petElements.length > 10) {
        console.log(`  ... and ${info.petElements.length - 10} more`);
      }
    }

    if (info.searchElements.length > 0) {
      console.log(`\n🔍 Search-related elements:`);
      info.searchElements.slice(0, 10).forEach((el) => console.log(`  ${el}`));
    }

    console.log(`\n🖼️ Sample images:`);
    info.imageInfo.forEach((img, i) => {
      console.log(
        `  ${i + 1}. ${img.src}... (alt: "${img.alt}", parent: ${img.parent})`
      );
    });

    console.log(
      '\n⏸️  Browser left open for manual inspection. Close it when done.'
    );
    console.log('     Press Ctrl+C to close the browser and exit.');

    // Keep the browser open for manual inspection
    await new Promise(() => {}); // Wait indefinitely
  } catch (error) {
    console.error('Error debugging site:', error);
  } finally {
    await browser.close();
  }
}

const url = process.argv[2] || 'https://www.adoptapet.com.au/';
debugSite(url).catch(console.error);
