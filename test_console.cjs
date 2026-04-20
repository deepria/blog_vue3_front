const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    
    // Capture and print console logs
    page.on('console', msg => console.log('BROWSER_CONSOLE:', msg.text()));
    page.on('pageerror', err => console.error('BROWSER_ERROR:', err.message));
    page.on('requestfailed', request => console.error('REQUEST_FAILED:', request.url(), request.failure()?.errorText));

    await page.goto('http://localhost:5173/todo', { waitUntil: 'networkidle2' });
    
    // Check if #app is mounted and has content
    const appHtml = await page.evaluate(() => document.getElementById('app')?.innerHTML?.substring(0, 500));
    console.log('APP_INNERHTML:', appHtml || 'APP ID NOT FOUND');
    
    // Check click
    console.log('Attempting to find nav-item for /memo...');
    const linkExists = await page.evaluate(() => !!document.querySelector('a.nav-item[href="/memo"]'));
    console.log('Link Exists:', linkExists);

    await browser.close();
  } catch (e) {
    console.error('Puppeteer Error:', e);
  }
})();
