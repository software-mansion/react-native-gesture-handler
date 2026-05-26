import { CallbackIDs } from 'common-app/src/e2e_screens/utils';
import { by, device, element, waitFor } from 'detox';

export async function navigateTo(screenName: string) {
  await device.launchApp({ newInstance: false });
  await element(by.id('back-to-home'))
    .tap()
    .catch(async () => {
      await device.reloadReactNative();
    });
  await waitFor(element(by.text(screenName)))
    .toBeVisible()
    .whileElement(by.id('examples-list'))
    .scroll(2000, 'down');
  await element(by.text(screenName)).tap();
}

export const CB = {
  B: CallbackIDs.onBegin,
  A: CallbackIDs.onActivate,
  U: CallbackIDs.onUpdate,
  D: CallbackIDs.onDeactivate,
  F: CallbackIDs.onFinalize,
};

export { TestScreens } from 'common-app/src/e2e_screens/utils';
