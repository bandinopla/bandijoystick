import { test, expect } from '@playwright/test';

test('Stopwatch App', async ({ page, context, browser }) => { 
  
  await page.goto('http://localhost:5173/apps/stopwatch');

  const url = await page.locator('canvas[data-url]').getAttribute('data-url');
 
  expect(url).toBeTruthy();

  const phoneContext = await browser.newContext({
	  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)...',
	  viewport: { width: 390, height: 844 },
	  isMobile: true,
	  hasTouch: true,
	});

  const phone = await phoneContext.newPage();
  
  await phone.goto(`http://localhost:5173${url}`);

  // by then I should wait for the keys to show.
  const playButton = phone.locator('div#play>div'); 

  await playButton.tap();

  await page.waitForTimeout(2000);

  const time = await page.locator("div#lap-time").textContent();

  expect(time).not.toEqual("00:00:00.000");
 

});