import { beforeAll, beforeEach, describe, it } from '@jest/globals';
import { by, device, element, expect } from 'detox';

describe('test require to fail gesture composition', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
    await element(by.id('nav-composition')).tap();
    await element(by.id('nav-require-to-fail')).tap();
  });

  const innerElement = element(by.id('inner-idle'));
  const outerElement = element(by.id('outer-idle'));
  const innerActivatedElement = element(by.id('inner-activated'));
  const outerActivatedElement = element(by.id('outer-activated'));
  const resetButton = element(by.id('reset'));

  beforeEach(async () => {
    await resetButton.tap();
  });

  it('should activate the outer tap when the inner double tap fails', async () => {
    await expect(innerElement).toExist();

    await innerElement.tap();

    await expect(outerActivatedElement).toExist();
    await expect(innerActivatedElement).not.toExist();
  });

  it('should activate the inner tap on a double tap', async () => {
    await expect(outerElement).toExist();

    await innerElement.multiTap(2);

    await expect(innerActivatedElement).toExist();
    await expect(outerActivatedElement).not.toExist();
  });
});