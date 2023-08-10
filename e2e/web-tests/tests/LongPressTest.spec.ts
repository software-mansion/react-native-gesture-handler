/* eslint-disable jest/consistent-test-it */
import { test, expect } from '@playwright/test';
import {
  DEFAULT_PORT,
  getEvent,
  LONG_PRESS_ACTIVATION_TIME,
  sleep,
} from '../utils';

test.use({ hasTouch: true });

test('Long Press Test', async ({ page }) => {
  await page.goto(`localhost:${DEFAULT_PORT}/`);

  const stateBox = page.locator('[data-testid="longPressStateBox"]');
  const eventBox = page.locator('[data-testid="longPressEventBox"]');
  let event;

  // Long Press state is UNDETERMINED
  await expect(stateBox).toHaveText('0');

  // Move mouse to center of LongPress div
  await page.mouse.move(350, 50);

  await page.mouse.down();

  // After mousedown, long press should be in BEGAN state
  event = await getEvent(eventBox);
  expect(event.nativeEvent.state).toBe(2);

  await page.mouse.up();

  // After mouseup, long press should FAIL
  event = await getEvent(eventBox);
  expect(event.nativeEvent.state).toBe(1);

  await page.mouse.down();
  event = await getEvent(eventBox);
  expect(event.nativeEvent.state).toBe(2);

  // Waits for activation
  await sleep(LONG_PRESS_ACTIVATION_TIME);

  // Long press should be in ACTIVE state
  event = await getEvent(eventBox);
  expect(event.nativeEvent.state).toBe(4);

  await page.mouse.up();

  // Long press should END
  event = await getEvent(eventBox);
  expect(event.nativeEvent.state).toBe(5);

  await page.mouse.down();

  // Moving mouse while long press is in BEGAN
  await page.mouse.move(375, 75);

  // After moving mouse, long press should FAIL
  event = await getEvent(eventBox);
  expect(event.nativeEvent.state).toBe(1);

  await page.mouse.up();

  await page.mouse.down();
  event = await getEvent(eventBox);
  expect(event.nativeEvent.state).toBe(2);

  // Waits for activation
  await sleep(LONG_PRESS_ACTIVATION_TIME);
  event = await getEvent(eventBox);
  expect(event.nativeEvent.state).toBe(4);

  await page.mouse.move(350, 50);

  // Long press should be in CANCELLED state
  event = await getEvent(eventBox);
  expect(event.nativeEvent.state).toBe(3);
});
