import { test, expect } from '@playwright/test';

test('loads the example page', async ({ page }) => {
  // Avoid chromium weirdness:
  await page.waitForTimeout(1_000);

  page.on('console', (msg) => {
    console.log(`Console log: ${msg.text()}`);
  });

  await page.goto('/');
  await expect(page).toHaveTitle(/microdsp-web example/i);
  await expect(page.locator('#range-container')).toBeHidden();

  // Enough time for the audio context to be ready.
  await page.waitForTimeout(1_000);

  const button = page.locator('#start-button');

  if ((await button.textContent()) === 'Run') {
    await button.click();
    await page.waitForTimeout(500);
  }

  await expect(button).toHaveText('Pause');

  // mic mode

  const statusEl = page.locator('dl > dd > span').first();
  expect(await statusEl.textContent()).toBe('running');

  const pitchEl = page.locator('#pitch');
  await expect(pitchEl.locator('> span')).toHaveText(/400\.[0-9]{2} Hz/);
  const clarityEl = page.locator('#clarity');
  expect(Number(await clarityEl.textContent())).toBeGreaterThan(0.5);

  const framesProcessedEl = page.locator('#frames-processed');
  const framesProcessed = Number(await framesProcessedEl.textContent());
  expect(framesProcessed).toBeGreaterThan(0);

  // tone mode (default 440 Hz)

  const inputSelect = page.locator('#input-select');
  inputSelect.selectOption('tone');

  await expect(page.locator('#range-container')).toBeVisible();

  const rangeLabelEl = page.locator('label[for="freq-range"]');
  await expect(rangeLabelEl).toHaveText('440 Hz');

  await expect(pitchEl.locator('> span')).toHaveText('440.00 Hz');
  expect(clarityEl).toHaveText('1.00');

  const framesProcessedNow = Number(await framesProcessedEl.textContent());
  expect(framesProcessedNow).toBeGreaterThan(framesProcessed);

  // tone mode (change to 880 Hz)

  const rangeEl = page.locator('#freq-range');
  await rangeEl.evaluate((el: HTMLInputElement) => {
    el.value = '880';
    el.dispatchEvent(new Event('input', { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
  });
  await expect(rangeLabelEl).toHaveText('880 Hz');
  await expect(pitchEl.locator('> span')).toHaveText('880.00 Hz');
  expect(clarityEl).toHaveText('1.00');
});
