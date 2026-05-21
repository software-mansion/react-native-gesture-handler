// eslint-disable-next-line import-x/no-extraneous-dependencies
import { beforeAll, beforeEach, describe } from '@jest/globals';
import { TestScreens } from 'common-app/src/e2e_screens/screenNames';
import { by, element, expect } from 'detox';

import { navigateTo } from '../utils';

describe('test tap gesture', () => {
  beforeAll(async () => {
    await navigateTo(TestScreens.Tap);
  });

  const gestureBox = element(by.id('tap-box'));
  const stateIndicator = element(by.id('state-indicator'));
  const resetButton = element(by.id('reset'));

  beforeEach(async () => {
    await resetButton.tap();
  });

  test('Should register tap gesture', async () => {
    await gestureBox.tap();
    await expect(stateIndicator).toHaveText('1245');
  });

  test('Should register tap gesture on long press', async () => {
    await gestureBox.longPress(1000);
    await expect(stateIndicator).toHaveText('15');
  });
});
