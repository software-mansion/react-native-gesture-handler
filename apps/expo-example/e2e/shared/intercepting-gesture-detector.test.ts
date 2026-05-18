import { beforeAll, beforeEach, describe, it } from '@jest/globals';
import { by, device, element, expect, waitFor } from 'detox';

describe('intercepting gesture detector', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
    await waitFor(element(by.text('Intercepting Gesture Detector')))
      .toBeVisible()
      .whileElement(by.id('examples-list'))
      .scroll(500, 'down');
    await element(by.text('Intercepting Gesture Detector')).tap();
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
