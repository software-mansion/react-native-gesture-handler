// eslint-disable-next-line import-x/no-extraneous-dependencies
import { beforeAll, describe } from '@jest/globals';
import { by, element, expect } from 'detox';

import { CB, navigateTo, TestScreens } from '../../utils';

export function tapTests() {
  describe('test tap gesture', () => {
    beforeAll(async () => {
      await navigateTo(TestScreens.Tap);
    });

    const gestureBox = element(by.id('tap-box'));
    const stateIndicator = element(by.id('state-indicator'));
    const extractButton = element(by.id('extract-button'));

    test('Should register tap gesture', async () => {
      await gestureBox.tap();
      await extractButton.tap();
      await expect(stateIndicator).toHaveText(
        `{Tap: ${CB.B}${CB.A}${CB.D}${CB.F}}`
      );
    });

    test('Should register tap gesture on long press', async () => {
      await gestureBox.longPress(1000);
      await extractButton.tap();
      await expect(stateIndicator).toHaveText(`{Tap: ${CB.B}${CB.F}}`);
    });
  });
}
