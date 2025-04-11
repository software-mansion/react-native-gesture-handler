/* eslint-disable jest/consistent-test-it */
import { test, expect } from '@playwright/test';
import { DEFAULT_PORT, getEvent } from '../utils';

test.use({ hasTouch: true });

test('Tap Test', async ({ page }) => {
  await page.goto(`localhost:${DEFAULT_PORT}/`);

  const stateBox = page.locator('[data-testid="tapStateBox"]');
  const eventBox = page.locator('[data-testid="tapEventBox"]');
  let event;

  // Tap state is UNDETERMINED
  await expect(stateBox).toHaveText('0');

  //Move mouse cursor to middle of tap box
  await page.mouse.move(50, 50);

  await page.mouse.down();

  //After downclick tap should be in BEGAN state
  event = await getEvent(eventBox);
  expect(event.nativeEvent.state).toBe(2);

  await page.mouse.up();

  // After mouseup, tap should END
  event = await getEvent(eventBox);
  expect(event.nativeEvent.state).toBe(5);

  await page.mouse.click(50, 50, { delay: 1000 });

  // After not releasing pointer for a second, tap should FAIL
  event = await getEvent(eventBox);
  expect(event.nativeEvent.state).toBe(1);
});
