import { use } from 'react';
import { Platform } from 'react-native';

import GestureHandlerRootViewContext from '../../GestureHandlerRootViewContext';
import { isTestEnv } from '../../utils';

const ERROR_MESSAGE =
  'GestureDetector must be used as a descendant of GestureHandlerRootView. Otherwise the gestures will not be recognized. See https://docs.swmansion.com/react-native-gesture-handler/docs/fundamentals/installation for more details.';

const JEST_ERROR_MESSAGE = `${ERROR_MESSAGE} In Jest, wrap the rendered tree in GestureHandlerRootView or disable this check by adding 'react-native-gesture-handler/jest-setup/disableRootViewCheck.js' to setupFiles. See https://docs.swmansion.com/react-native-gesture-handler/docs/guides/testing#rendering-without-gesturehandlerrootview for more details.`;

export function useEnsureGestureHandlerRootView() {
  const rootViewContext = use(GestureHandlerRootViewContext);

  if (__DEV__ && !rootViewContext && Platform.OS !== 'web') {
    throw new Error(isTestEnv() ? JEST_ERROR_MESSAGE : ERROR_MESSAGE);
  }
}
