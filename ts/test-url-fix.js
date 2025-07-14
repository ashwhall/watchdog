// Quick test for the URL conversion fix
function testUrlConversion(url) {
  // Replicate the URL conversion logic from FacebookScraper
  let mobileUrl = url;
  if (mobileUrl.includes('www.facebook.com')) {
    mobileUrl = mobileUrl.replace('www.facebook.com', 'm.facebook.com');
  } else if (
    mobileUrl.includes('facebook.com') &&
    !mobileUrl.includes('m.facebook.com')
  ) {
    mobileUrl = mobileUrl.replace('facebook.com', 'm.facebook.com');
  }
  // If it's already m.facebook.com, leave it as is

  return mobileUrl;
}

// Test cases
const testCases = [
  'https://www.facebook.com/FFARau',
  'https://facebook.com/FFARau',
  'https://m.facebook.com/FFARau',
  'https://m.facebook.com/FFARau/posts/123',
];

console.log('Testing URL conversion logic:');
testCases.forEach((url) => {
  const result = testUrlConversion(url);
  console.log(`${url} -> ${result}`);
});
