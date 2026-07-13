import { use } from 'react';

import GestureHandlerRootViewContext from '../../GestureHandlerRootViewContext';
import type { CoreRuntime } from '../platform/Port';

export function useEnsureGestureHandlerRootView(runtime: CoreRuntime) {
  const rootViewContext = use(GestureHandlerRootViewContext);

  if (
    __DEV__ &&
    !rootViewContext &&
    runtime.port.capabilities.requiresRootView
  ) {
    throw new Error(
      'GestureDetector must be used as a descendant of GestureHandlerRootView. Otherwise the gestures will not be recognized. See https://docs.swmansion.com/react-native-gesture-handler/docs/fundamentals/installation for more details.'
    );
  }
}
