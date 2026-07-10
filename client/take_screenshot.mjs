import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });
  await page.goto('http://localhost:5173/admin', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: 'd:\\TripWise\\screenshot-admin.png' });
  await page.goto('http://localhost:5173/', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: 'd:\\TripWise\\screenshot-landing.png' });
  await browser.close();
  console.log("Screenshots captured");
})();
