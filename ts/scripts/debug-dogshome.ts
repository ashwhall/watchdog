// scripts/debug-dogshome.ts
import axios from 'axios';
import * as cheerio from 'cheerio';

async function debugDogHome() {
  const url =
    'https://dogshome.com/dog-adoption/adopt-a-dog/?sex=&breed1=&age=&animalid=&Submit=Submit&resulttype=1';

  console.log(`🔍 Debugging: ${url}`);

  try {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      },
    });

    console.log(`✅ Response status: ${response.status}`);
    console.log(`📄 Content type: ${response.headers['content-type']}`);

    const $ = cheerio.load(response.data);

    const pageInfo = {
      title: $('title').text(),
      bodyLength: response.data.length,
      totalImages: $('img').length,
      totalLinks: $('a').length,
    };

    console.log('\n📊 Page Analysis:');
    console.log(`  Title: ${pageInfo.title}`);
    console.log(`  Body length: ${pageInfo.bodyLength} chars`);
    console.log(`  Total images: ${pageInfo.totalImages}`);
    console.log(`  Total links: ${pageInfo.totalLinks}`);

    // Look for images with their contexts
    console.log('\n🖼️ Image analysis:');
    const images: Array<{
      src: string;
      alt: string;
      hasParentLink: boolean;
      parentHref?: string;
    }> = [];

    $('img').each((_, element) => {
      const img = $(element);
      const src = img.attr('src') || img.attr('data-src') || '';
      const alt = img.attr('alt') || '';

      let link = img.closest('a');
      if (!link.length) {
        link = img.parent().closest('a');
      }

      const hasParentLink = link.length > 0;
      const parentHref = hasParentLink ? link.attr('href') : undefined;

      if (src) {
        images.push({ src, alt, hasParentLink, parentHref });
      }
    });

    console.log(`  Found ${images.length} images with src attributes`);

    // Show first 5 images
    images.slice(0, 5).forEach((img, i) => {
      console.log(`  ${i + 1}. ${img.src.substring(0, 60)}...`);
      console.log(`     Alt: "${img.alt}"`);
      console.log(`     Has link: ${img.hasParentLink}`);
      if (img.parentHref) {
        console.log(`     Link: ${img.parentHref.substring(0, 60)}...`);
      }
      console.log('');
    });

    // Look for specific dog-related content
    console.log('🐕 Looking for dog-related content:');
    const dogKeywords = ['dog', 'puppy', 'canine', 'adopt', 'pet'];

    dogKeywords.forEach((keyword) => {
      const matches = response.data.toLowerCase().split(keyword).length - 1;
      if (matches > 0) {
        console.log(`  "${keyword}": ${matches} matches`);
      }
    });

    // Check if there are forms or if it's asking for search criteria
    const forms = $('form').length;
    console.log(`\n📝 Forms found: ${forms}`);

    if (forms > 0) {
      $('form').each((i, form) => {
        const action = $(form).attr('action') || 'no action';
        const method = $(form).attr('method') || 'GET';
        console.log(`  Form ${i + 1}: ${method} ${action}`);
      });
    }

    // Look for text that might indicate no results
    const noResultsKeywords = [
      'no results',
      'no dogs',
      'no pets',
      'not found',
      'search returned 0',
    ];
    const bodyText = response.data.toLowerCase();

    console.log('\n❌ Checking for "no results" indicators:');
    noResultsKeywords.forEach((keyword) => {
      if (bodyText.includes(keyword)) {
        console.log(`  Found: "${keyword}"`);
      }
    });
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

debugDogHome()
  .then(() => console.log('🎉 Debug completed'))
  .catch(console.error);
