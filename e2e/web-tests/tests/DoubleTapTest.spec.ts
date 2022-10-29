/* eslint-disable jest/consistent-test-it */
import { test, expect } from '@playwright/test';
import { DOUBLE_TAP_FAIL_TIMEOUT, getEvent, sleep } from '../utils';

test.use({ hasTouch: true });

test('Double Tap Test', async ({ page }) => {
  await page.goto('localhost:19007/');
  const box = page.locator('[data-testid="tapTextTest"]');

  const singleTapEventBox = page.locator('[data-testid="singleTapEventBox"]');
  const doubleTapEventBox = page.locator('[data-testid="doubleTapEventBox"]');

  let singleTapEvent, doubleTapEvent;

  // At begining, both tap handlers should have UNDETERMINED state
  await expect(box).toHaveText('0:0');

  // Move mouse to center of handlers test box
  await page.mouse.move(250, 50);

  // Single tap test
  await page.mouse.down();

  singleTapEvent = await getEvent(singleTapEventBox);
  doubleTapEvent = await getEvent(doubleTapEventBox);

  // Both handlers should be in ACTIVE state
  expect(singleTapEvent.nativeEvent.state).toBe(2);
  expect(doubleTapEvent.nativeEvent.state).toBe(2);

  await page.mouse.up();

  // Awaits for double tap to fail,
  await sleep(DOUBLE_TAP_FAIL_TIMEOUT);

  singleTapEvent = await getEvent(singleTapEventBox);
  doubleTapEvent = await getEvent(doubleTapEventBox);

  // At that point, single tap should END and doubleTap should FAIL
  expect(singleTapEvent.nativeEvent.state).toBe(5);
  expect(doubleTapEvent.nativeEvent.state).toBe(1);

  // Holding press until both handlers fail
  await page.mouse.click(250, 50, { delay: 1500 });

  // After not realising pointer, both handlers should FAIL
  singleTapEvent = await getEvent(singleTapEventBox);
  doubleTapEvent = await getEvent(doubleTapEventBox);

  expect(singleTapEvent.nativeEvent.state).toBe(1);
  expect(doubleTapEvent.nativeEvent.state).toBe(1);

  // Double click test
  await page.mouse.dblclick(250, 50);

  singleTapEvent = await getEvent(singleTapEventBox);
  doubleTapEvent = await getEvent(doubleTapEventBox);

  // After double click, single tap handler should be CANCELLED and double tap handler should END
  expect(singleTapEvent.nativeEvent.state).toBe(3);
  expect(doubleTapEvent.nativeEvent.state).toBe(5);
});
