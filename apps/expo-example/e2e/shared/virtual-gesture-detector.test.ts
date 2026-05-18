import { beforeAll, beforeEach, describe, it } from '@jest/globals';
import { by, device, element, expect, waitFor } from 'detox';

describe('virtual gesture detector', () => {
  beforeAll(async () => {
    await device.launchApp({ newInstance: true });
    await waitFor(element(by.text('Virtual Gesture Detector')))
      .toBeVisible()
      .whileElement(by.id('examples-list'))
      .scroll(500, 'down');
    await element(by.text('Virtual Gesture Detector')).tap();
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
