// eslint-disable-next-line import-x/no-extraneous-dependencies
import { beforeAll, describe } from '@jest/globals';
import { by, element, expect } from 'detox';

import { CB, navigateTo, TestScreens } from '../utils';

export function flingTests() {
  describe('test fling gesture', () => {
    beforeAll(async () => {
      await navigateTo(TestScreens.Fling);
    });

    const gestureBox = element(by.id('fling-box'));
    const stateIndicator = element(by.id('state-indicator'));
    const extractButton = element(by.id('extract-button'));

    test('Should register fling gesture', async () => {
      await gestureBox.swipe('right', 'fast');
      await extractButton.tap();
      await expect(stateIndicator).toHaveText(
        `{Fling: ${CB.B}${CB.A}${CB.D}${CB.F}}`
      );
    });

    test("Shouldn't register fling gesture", async () => {
      await gestureBox.tap();
      await extractButton.tap();
      await expect(stateIndicator).toHaveText(`{Fling: ${CB.B}${CB.F}}`);
    });
  });
}
