import { beforeAll, beforeEach, describe, it } from '@jest/globals';
import { by, device, element, expect } from 'detox';

describe('virtual gesture detector', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: false });
    await element(by.id('nav-detecor-tests')).tap();
    await element(by.id('nav-virtual-gesture-detector')).tap();
  });

  const text = element(by.id('text'));
  const tapActivatedElement = element(by.id('tap-activated'));
  const tapElement = element(by.id('tap-idle'));
  const resetButton = element(by.id('reset'));

  beforeEach(async () => {
    await resetButton.tap();
  });

  it('should not register a tap gesture when tapping wrong element', async () => {
    await expect(text).toExist();
    await text.tap();
    await expect(tapActivatedElement).not.toExist();
  });

  it('should register a tap gesture when tapping the target word', async () => {
    await expect(tapElement).toExist();
    await tapElement.tap();
    await expect(tapActivatedElement).toExist();
  });
});
