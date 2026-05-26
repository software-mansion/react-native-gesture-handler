// eslint-disable-next-line import-x/no-extraneous-dependencies
import { beforeAll, describe } from '@jest/globals';
import { by, element, expect } from 'detox';

import { CB, navigateTo, TestScreens } from '../../utils';

export function competingTests() {
  describe('test competing gestures', () => {
    beforeAll(async () => {
      await navigateTo(TestScreens.Competing);
    });

    const gestureBox = element(by.id('competing-box'));
    const stateIndicator = element(by.id('state-indicator'));
    const extractButton = element(by.id('extract-button'));

    test('Should activate tap gesture on tap', async () => {
      await gestureBox.tap();
      await extractButton.tap();
      await expect(stateIndicator).toHaveText(
        `{Pan: ${CB.B}${CB.F}, Tap: ${CB.B}${CB.A}${CB.D}${CB.F}}`
      );
    });

    test('Should activate pan gesture on swipe', async () => {
      await gestureBox.swipe('right', 'fast');
      await extractButton.tap();
      await expect(stateIndicator).toHaveText(
        `{Pan: ${CB.B}${CB.A}${CB.U}${CB.D}${CB.F}, Tap: ${CB.B}${CB.F}}`
      );
    });
  });
}
