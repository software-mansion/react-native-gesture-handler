import { use } from 'react';
import { Platform } from 'react-native';
import GestureHandlerRootViewContext from '../../GestureHandlerRootViewContext';

export function useEnsureGestureHandlerRootView() {
  const rootViewContext = use(GestureHandlerRootViewContext);

  if (__DEV__ && !rootViewContext && Platform.OS !== 'web') {
    throw new Error(
      'GestureDetector must be used as a descendant of GestureHandlerRootView. Otherwise the gestures will not be recognized. See https://docs.swmansion.com/react-native-gesture-handler/docs/fundamentals/installation for more details.'
    );
  }
}
