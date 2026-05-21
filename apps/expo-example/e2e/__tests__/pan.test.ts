// eslint-disable-next-line import-x/no-extraneous-dependencies
import { beforeAll, beforeEach, describe } from '@jest/globals';
import { by, element, expect } from 'detox';

import { navigateTo } from '../utils';

describe('test pan gesture', () => {
  beforeAll(async () => {
    await navigateTo('[E2E] Pan');
  });

  const gestureBox = element(by.id('pan-box'));
  const stateIndicator = element(by.id('state-indicator'));
  const resetButton = element(by.id('reset'));

  beforeEach(async () => {
    await resetButton.tap();
  });

  test('Shouldn`t register a pan gesture on tap', async () => {
    await gestureBox.tap();
    await expect(stateIndicator).toHaveText('15');
  });

  test('Should register pan gesture on swipe', async () => {
    await gestureBox.swipe('right', 'fast');
    await expect(stateIndicator).toHaveText('12345');
  });
});
