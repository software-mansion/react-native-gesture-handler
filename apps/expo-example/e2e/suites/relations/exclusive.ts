// eslint-disable-next-line import-x/no-extraneous-dependencies
import { beforeAll, describe } from '@jest/globals';
import { by, element, expect } from 'detox';

import { CB, navigateTo, TestScreens } from '../../utils';

export function exclusiveTests() {
  describe('test exclusive gestures (tap + double tap)', () => {
    beforeAll(async () => {
      await navigateTo(TestScreens.Exclusive);
    });

    const gestureBox = element(by.id('exclusive-box'));
    const stateIndicator = element(by.id('state-indicator'));
    const extractButton = element(by.id('extract-button'));

    test('Should activate only tap gesture on single tap', async () => {
      await gestureBox.tap();
      await extractButton.tap();
      await expect(stateIndicator).toHaveText(
        `{DoubleTap: ${CB.B}${CB.F}, Tap: ${CB.B}${CB.A}${CB.D}${CB.F}}`
      );
    });

    test('Should activate only double tap gesture on double tap', async () => {
      await gestureBox.multiTap(2);
      await extractButton.tap();
      await expect(stateIndicator).toHaveText(
        `{DoubleTap: ${CB.B}${CB.A}${CB.D}${CB.F}, Tap: ${CB.B}${CB.F}}`
      );
    });
  });
}
