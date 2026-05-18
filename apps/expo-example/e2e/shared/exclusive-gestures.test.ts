import { beforeAll, beforeEach, describe, it } from '@jest/globals';
import { by, device, element, expect } from 'detox';
import { navigateTo } from './utils';

describe('test exclusive gesture composition', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: false });
    await navigateTo('Exclusive Gestures');
  });

  const box = element(by.id('exclusive-idle'));
  const doubleTapActivatedElement = element(
    by.id('exclusive-double-tap-activated')
  );
  const singleTapActivatedElement = element(
    by.id('exclusive-single-tap-activated')
  );
  const resetButton = element(by.id('reset'));

  beforeEach(async () => {
    await resetButton.tap();
  });

  it('should activate single tap on a single tap', async () => {
    await expect(box).toExist();
    await box.tap();
    await expect(singleTapActivatedElement).toExist();
    await expect(doubleTapActivatedElement).not.toExist();
  });

  it('should activate double tap on a double tap', async () => {
    await expect(box).toExist();
    await box.multiTap(2);
    await expect(doubleTapActivatedElement).toExist();
    await expect(singleTapActivatedElement).not.toExist();
  });
});
