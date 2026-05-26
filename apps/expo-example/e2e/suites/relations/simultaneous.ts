// eslint-disable-next-line import-x/no-extraneous-dependencies
import { beforeAll, describe } from '@jest/globals';
import { by, element, expect } from 'detox';

import { CB, navigateTo, TestScreens } from '../../utils';

export function simultaneousTests() {
  describe('test simultaneous gestures', () => {
    beforeAll(async () => {
      await navigateTo(TestScreens.Simultaneous);
    });

    const gestureBox = element(by.id('simultaneous-box'));
    const stateIndicator = element(by.id('state-indicator'));
    const extractButton = element(by.id('extract-button'));

    test('Should activate both pan gestures on swipe', async () => {
      await gestureBox.swipe('right', 'fast');
      await extractButton.tap();
      await expect(stateIndicator).toHaveText(
        `{Pan1: ${CB.B}${CB.A}${CB.U}${CB.D}${CB.F}, Pan2: ${CB.B}${CB.A}${CB.U}${CB.D}${CB.F}}`
      );
    });
  });
}
