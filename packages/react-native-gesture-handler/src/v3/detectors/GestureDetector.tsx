import { NativeDetectorProps } from './common';
import { BaseGesture } from '../../handlers/gestures/gesture';
import { NativeDetector } from './NativeDetector';
import { ComposedGesture } from '../../handlers/gestures/gestureComposition';
import {
  GestureDetectorProps as LegacyGestureDetectorProps,
  GestureDetector as LegacyGestureDetector,
} from '../../handlers/gestures/GestureDetector';
import { DetectorContext } from './LogicDetector/useDetectorContext';
import { LogicDetector } from './LogicDetector/LogicDetector';
import { use } from 'react';
import { isTestEnv } from '../../utils';
import { Platform } from 'react-native';
import GestureHandlerRootViewContext from '../../GestureHandlerRootViewContext';

export function GestureDetector<THandlerData, TConfig>(
  props: NativeDetectorProps<THandlerData, TConfig> | LegacyGestureDetectorProps
) {
  const rootViewContext = use(GestureHandlerRootViewContext);

  if (__DEV__ && !rootViewContext && !isTestEnv() && Platform.OS !== 'web') {
    throw new Error(
      'GestureDetector must be used as a descendant of GestureHandlerRootView. Otherwise the gestures will not be recognized. See https://docs.swmansion.com/react-native-gesture-handler/docs/fundamentals/installation for more details.'
    );
  }

  if (
    props.gesture instanceof ComposedGesture ||
    props.gesture instanceof BaseGesture
  ) {
    return <LegacyGestureDetector {...(props as LegacyGestureDetectorProps)} />;
  }

  const context = use(DetectorContext);
  return context ? (
    <LogicDetector {...(props as NativeDetectorProps<THandlerData, TConfig>)} />
  ) : (
    <NativeDetector
      {...(props as NativeDetectorProps<THandlerData, TConfig>)}
    />
  );
}
