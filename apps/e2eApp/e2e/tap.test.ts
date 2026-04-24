import { beforeAll, beforeEach, describe, it } from '@jest/globals';
import { by, device, element, expect } from 'detox';

describe('test tap gesture', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: false });
    await element(by.id('nav-tap')).tap();
  });

  const wrongElement = element(by.id('title'));
  const tapActivatedElement = element(by.id('tap-activated'));
  const tapElement = element(by.id('tap-idle'));
  const resetButton = element(by.id('reset'));

  beforeEach(async () => { await resetButton.tap(); });

  it('shouldn`t register a tap gesture', async () => {
    await expect(wrongElement).toExist();
    await wrongElement.tap();
    await expect(tapActivatedElement).not.toExist();
  });

  it('should register a tap gesture', async () => {
    await expect(tapElement).toExist();
    await tapElement.tap();
    await expect(tapActivatedElement).toExist();
  });

  it('should handle multiple taps a tap gesture', async () => {
    await expect(tapElement).toExist();
    await tapElement.multiTap(3);
    await expect(tapActivatedElement).toExist();
  });

  it('shouldnt change state due to multiple taps', async () => {
    await expect(tapElement).toExist();
    await tapElement.tap();
    await tapActivatedElement.tap();
    await expect(tapActivatedElement).toExist();
  });
});
