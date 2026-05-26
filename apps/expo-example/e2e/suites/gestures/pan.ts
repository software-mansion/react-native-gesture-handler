// eslint-disable-next-line import-x/no-extraneous-dependencies
import { beforeAll, describe } from '@jest/globals';
import { by, element, expect } from 'detox';

import { CB, navigateTo, TestScreens } from '../../utils';

export function panTests() {
  describe('test pan gesture', () => {
    beforeAll(async () => {
      await navigateTo(TestScreens.Pan);
    });

    const gestureBox = element(by.id('pan-box'));
    const stateIndicator = element(by.id('state-indicator'));
    const extractButton = element(by.id('extract-button'));

    test("Shouldn't register a pan gesture on tap", async () => {
      await gestureBox.tap();
      await extractButton.tap();
      await expect(stateIndicator).toHaveText(`{Pan: ${CB.B}${CB.F}}`);
    });

    test('Should register pan gesture on swipe', async () => {
      await gestureBox.swipe('right', 'fast');
      await extractButton.tap();
      await expect(stateIndicator).toHaveText(
        `{Pan: ${CB.B}${CB.A}${CB.U}${CB.D}${CB.F}}`
      );
    });
  });
}
