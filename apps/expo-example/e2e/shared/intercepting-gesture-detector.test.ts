import { beforeAll, beforeEach, describe, it } from '@jest/globals';
import { by, element, expect } from 'detox';
import { navigateTo } from './utils';

describe('intercepting gesture detector', () => {
  beforeAll(async () => {
    await navigateTo('Intercepting Gesture Detector');
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
