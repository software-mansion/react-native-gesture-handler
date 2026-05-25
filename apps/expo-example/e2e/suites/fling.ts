// eslint-disable-next-line import-x/no-extraneous-dependencies
import { beforeAll, beforeEach, describe } from '@jest/globals';
import { TestScreens } from 'common-app/src/e2e_screens/screenNames';
import { by, element, expect } from 'detox';

import { navigateTo } from '../utils';

export function flingTests() {
  describe('test fling gesture', () => {
    beforeAll(async () => {
      await navigateTo(TestScreens.Fling);
    });

    const gestureBox = element(by.id('fling-box'));
    const stateIndicator = element(by.id('state-indicator'));
    const resetButton = element(by.id('reset'));

    beforeEach(async () => {
      await resetButton.tap();
    });

    test('Should register fling gesture', async () => {
      await gestureBox.swipe('right', 'fast');
      await expect(stateIndicator).toHaveText('1245');
    });

    test("Shouldn't register fling gesture", async () => {
      await gestureBox.tap();
      await expect(stateIndicator).toHaveText('15');
    });
  });
}
