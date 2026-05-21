// eslint-disable-next-line import-x/no-extraneous-dependencies
import { beforeAll, beforeEach, describe } from '@jest/globals';
import { TestScreens } from 'common-app/src/e2e_screens/screenNames';
import { by, element, expect } from 'detox';

import { navigateTo } from '../utils';

describe('test long press gesture', () => {
  beforeAll(async () => {
    await navigateTo(TestScreens.LongPress);
  });

  const gestureBox = element(by.id('long-press-box'));
  const stateIndicator = element(by.id('state-indicator'));
  const resetButton = element(by.id('reset'));

  beforeEach(async () => {
    await resetButton.tap();
  });

  test('Should register long press gesture', async () => {
    await gestureBox.longPress(1000);
    await expect(stateIndicator).toHaveText('1245');
  });

  test("Shouldn't register tap gesture", async () => {
    await gestureBox.tap();
    await expect(stateIndicator).toHaveText('15');
  });
});
