// eslint-disable-next-line import-x/no-extraneous-dependencies
import { beforeAll, beforeEach, describe } from '@jest/globals';
import { by, element, expect } from 'detox';

import { navigateTo } from './utils';

describe('test pan gesture', () => {
  beforeAll(async () => {
    await navigateTo('Pan Gesture');
  });

  const gestureBox = element(by.id('pan-box'));
  const stateIndicator = element(by.id('state-indicator'));
  const resetButton = element(by.id('reset'));
  const extractButton = element(by.id('event-extractor'));

  beforeEach(async () => {
    await resetButton.tap();
  });

  test('Shouldn`t register a pan gesture on tap', async () => {
    await gestureBox.tap();
    await extractButton.tap();
    await expect(stateIndicator).toHaveText('21');
  });

  test('Should register pan gesture on swipe', async () => {
    await gestureBox.swipe('right', 'fast');
    await extractButton.tap();
    await expect(stateIndicator).toHaveText('245');
  });
});
