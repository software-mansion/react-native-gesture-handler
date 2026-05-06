import { beforeAll, beforeEach, describe, it } from '@jest/globals';
import { by, device, element, expect } from 'detox';

describe('test pinch gesture', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: false });
    await element(by.id('nav-gesture-tests')).tap();
    await element(by.id('nav-pinch')).tap();
  });

  const wrongElement = element(by.id('wrong-element'));
  const pinchElement = element(by.id('pinch-idle'));
  const pinchActivatedElement = element(by.id('pinch-activated'));
  const resetButton = element(by.id('reset'));

  beforeEach(async () => {
    await expect(element(by.id('reset'))).toExist();
    await resetButton.tap();
  });

  it('shouldn`t register a pinch gesture on tap', async () => {
    await expect(pinchElement).toExist();
    await pinchElement.tap();
    await expect(pinchActivatedElement).not.toExist();
  });

  it('shouldn`t register a pinch gesture on different element', async () => {
    if (device.getPlatform() !== 'ios') {
      return;
    }

    await expect(wrongElement).toExist();
    await wrongElement.pinch(1.5, 'fast');
    await expect(pinchActivatedElement).not.toExist();
  });

  it('should register a pinch gesture', async () => {
    if (device.getPlatform() !== 'ios') {
      return;
    }

    await expect(pinchElement).toExist();
    await pinchElement.pinch(1.5, 'fast');
    await expect(pinchActivatedElement).toExist();
  });
});
