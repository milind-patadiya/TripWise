import puppeteer from 'puppeteer';

const ROUTES = [
  '/',
  '/login',
  '/register',
  '/dashboard',
  '/destinations',
  '/hotels',
  '/transport',
  '/packages',
  '/planner/setup',
  '/admin'
];

(async () => {
  console.log('Starting automated verification suite...');
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  let totalErrors = 0;

  // Track console errors
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log(`[Console Error]: ${msg.text()}`);
      totalErrors++;
    }
  });

  // Track network errors
  page.on('requestfailed', request => {
    console.log(`[Network Error]: ${request.url()} - ${request.failure().errorText}`);
    totalErrors++;
  });

  for (const route of ROUTES) {
    console.log(`\nTesting Route: ${route}`);
    try {
      const response = await page.goto(`http://localhost:5173${route}`, { waitUntil: 'networkidle2', timeout: 10000 });
      if (response && response.status() >= 400) {
        console.log(`❌ FAILED: HTTP ${response.status()}`);
        totalErrors++;
      } else {
        console.log(`✅ PASSED: Loaded successfully`);
      }
    } catch (err) {
      console.log(`❌ FAILED: Navigation error - ${err.message}`);
      totalErrors++;
    }
  }

  await browser.close();
  console.log(`\nVerification Complete. Total Errors Found: ${totalErrors}`);
})();
