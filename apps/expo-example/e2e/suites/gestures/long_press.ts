// eslint-disable-next-line import-x/no-extraneous-dependencies
import { beforeAll, describe } from '@jest/globals';
import { by, element, expect } from 'detox';

import { CB, navigateTo, TestScreens } from '../../utils';

export function longPressTests() {
  describe('test long press gesture', () => {
    beforeAll(async () => {
      await navigateTo(TestScreens.LongPress);
    });

    const gestureBox = element(by.id('long-press-box'));
    const stateIndicator = element(by.id('state-indicator'));
    const extractButton = element(by.id('extract-button'));

    test('Should register long press gesture', async () => {
      await gestureBox.longPress(1000);
      await extractButton.tap();
      await expect(stateIndicator).toHaveText(
        `{LongPress: ${CB.B}${CB.A}${CB.D}${CB.F}}`
      );
    });

    test("Shouldn't register tap gesture", async () => {
      await gestureBox.tap();
      await extractButton.tap();
      await expect(stateIndicator).toHaveText(`{LongPress: ${CB.B}${CB.F}}`);
    });
  });
}
