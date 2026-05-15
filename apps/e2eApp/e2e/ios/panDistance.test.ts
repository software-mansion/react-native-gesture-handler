import { beforeAll, beforeEach, describe, it } from '@jest/globals';
import { by, device, element, expect as expect } from 'detox';
import { IosElementAttributes } from 'detox/detox';

describe('test pan gesture', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: false });
    await element(by.id('nav-gesture-tests')).tap();
    await element(by.id('nav-pan')).tap();
  });

  const resetButton = element(by.id('reset'));
  const containerElement = element(by.id('container'));
  const xDistanceElement = element(by.id('x-distance'));

  beforeEach(async () => {
    await resetButton.tap();
  });

  it('should update coordinates on pan', async () => {
    await expect(containerElement).toExist();
    await containerElement.swipe('right', 'slow', 1, 0, 0.5);

    const attributes =
      (await xDistanceElement.getAttributes()) as IosElementAttributes;
    const xDistanceText = attributes.text;
    const xDistanceValue = parseFloat(xDistanceText!.split(': ')[1]);
    if (xDistanceValue !== 380.98) {
      throw new Error(
        `Expected diffrent x distance make sure the test runs on iphone 17`,
      );
    }
  });
});
