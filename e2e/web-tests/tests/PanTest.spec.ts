import { test, expect } from '@playwright/test';
import { getEvent } from '../utils';

test.use({ hasTouch: true });

test('Pan Test', async ({ page }) => {
  await page.goto('localhost:19007/');

  const stateBox = page.locator('[data-testid="panStateBox"]');
  const eventBox = page.locator('[data-testid="panEventBox"]');
  let event;

  // Pan is UNDETERMINED
  await expect(stateBox).toHaveText('0');

  // Move mouse to center of Pan div
  await page.mouse.move(150, 50);

  // Trigger mouse down, Pan should be in BEGAN state
  await page.mouse.down();

  event = await getEvent(eventBox);
  expect(event.nativeEvent.state).toBe(2);

  // After mouseup, Pan should FAIL
  await page.mouse.up();

  event = await getEvent(eventBox);
  expect(event.nativeEvent.state).toBe(1);

  // Trigger another mousedown, after moving cursor Pan should be ACTIVE
  await page.mouse.down();
  await page.mouse.move(175, 75);

  event = await getEvent(eventBox);
  expect(event.nativeEvent.state).toBe(4);
  expect(event.nativeEvent.absoluteX).toBe(175);
  expect(event.nativeEvent.absoluteY).toBe(75);
  expect(event.nativeEvent.x).toBe(75);
  expect(event.nativeEvent.y).toBe(75);

  // After mouseup Pan should END
  await page.mouse.up();

  event = await getEvent(eventBox);
  expect(event.nativeEvent.state).toBe(5);
});
