// eslint-disable-next-line import-x/no-extraneous-dependencies
import { beforeAll, beforeEach, describe } from '@jest/globals';
import { TestScreens } from 'common-app/src/e2e_screens/screenNames';
import { by, element, expect } from 'detox';

import { navigateTo } from '../utils';

describe('test pinch gesture', () => {
  beforeAll(async () => {
    await navigateTo(TestScreens.Pinch);
  });

  const gestureBox = element(by.id('pinch-box'));
  const stateIndicator = element(by.id('state-indicator'));
  const resetButton = element(by.id('reset'));

  beforeEach(async () => {
    await resetButton.tap();
  });

  test('Should register pinch gesture on pinch', async () => {
    await gestureBox.pinch(1.5, 'fast');
    await expect(stateIndicator).toHaveText('12345');
  });

  test('Shouldn`t register a pinch gesture on tap', async () => {
    await gestureBox.tap();
    await expect(stateIndicator).toHaveText('');
  });
});
