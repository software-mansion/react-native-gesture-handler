import {
  beforeAll,
  beforeEach,
  describe,
  expect as jestExpect,
  it,
} from '@jest/globals';
import { by, device, element, expect as detoxExpect } from 'detox';
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

  it('should update coordinates on pan (for iphone 15)', async () => {
    await detoxExpect(containerElement).toExist();
    await containerElement.swipe('right', 'slow', 1, 0, 0.5);

    const attributes =
      (await xDistanceElement.getAttributes()) as IosElementAttributes;
    const xDistanceText = attributes.text;
    const xDistanceValue = parseFloat(xDistanceText!.split(': ')[1]);
    jestExpect(xDistanceValue).toEqual(372.2); //this is constant for iphone 15
  });
});
