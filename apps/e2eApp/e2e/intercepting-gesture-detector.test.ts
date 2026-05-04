import { beforeAll, beforeEach, describe, it } from '@jest/globals';
import { by, device, element, expect } from 'detox';

describe('intercepting gesture detector', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: false });
    await element(by.id('nav-detecor-tests')).tap();
    await element(by.id('nav-intercepting-gesture-detector')).tap();
  });

  const tapActivatedElement = element(by.id('tap-activated'));
  const tapElement = element(by.id('tap-idle'));
  const resetButton = element(by.id('reset'));

  beforeEach(async () => {
    await resetButton.tap();
  });


  it('should register a tap gesture', async () => {
    await expect(tapElement).toExist();
    await tapElement.tap();
    await expect(tapActivatedElement).toExist();
  });

});
