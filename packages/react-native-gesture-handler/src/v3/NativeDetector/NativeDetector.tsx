import React, { RefObject, useCallback, useRef, useState } from 'react';
import { Animated, StyleSheet } from 'react-native';
import HostGestureDetector from './HostGestureDetector';
import { configureRelations, ensureNativeDetectorComponent } from './utils';
import { isComposedGesture } from '../hooks/utils/relationUtils';

export interface NativeDetectorProps<THandlerData, TConfig> {
  children?: React.ReactNode;
  gesture: Gesture<THandlerData, TConfig>;
}

export const AnimatedNativeDetector =
  Animated.createAnimatedComponent(HostGestureDetector);

export const ReanimatedNativeDetector =
  Reanimated?.default.createAnimatedComponent(HostGestureDetector);

export function NativeDetector<THandlerData, TConfig>({
  gesture,
  children,
}: NativeDetectorProps<THandlerData, TConfig>) {
  const [logicChildren, setLogicChildren] = useState<LogicChildren[]>([]);
  const logicMethods = useRef<Map<number, RefObject<GestureEvents<unknown>>>>(
    new Map()
  );

  const NativeDetectorComponent = gesture.config.dispatchesAnimatedEvents
    ? AnimatedNativeDetector
    : gesture.config.shouldUseReanimated
      ? ReanimatedNativeDetector
      : HostGestureDetector;

  ensureNativeDetectorComponent(NativeDetectorComponent);
  configureRelations(gesture);

  const handleGestureEvent = (key: keyof GestureEvents<THandlerData>) => {
    return (e: GestureHandlerEvent<THandlerData>) => {
      if (gesture.gestureEvents[key]) {
        gesture.gestureEvents[key](e);
      }

      logicMethods.current.forEach((ref) => {
        const method = ref.current?.[key];
        if (method) {
          method(e);
        }
      });
    };
  };

  const getHandlers = useCallback(
    (key: keyof GestureEvents<unknown>) => {
      const handlers: ((e: GestureHandlerEvent<THandlerData>) => void)[] = [];

      if (gesture.gestureEvents[key]) {
        handlers.push(
          gesture.gestureEvents[key] as (
            e: GestureHandlerEvent<unknown>
          ) => void
        );
      }
      moduleId={globalThis._RNGH_MODULE_ID}
      handlerTags={isComposedGesture(gesture) ? gesture.tags : [gesture.tag]}
      style={nativeDetectorStyles.detector}>
      {children}
    </NativeDetectorComponent>
  );
}

export const nativeDetectorStyles = StyleSheet.create({
  detector: {
    display: 'contents',
    // TODO: remove, debug info only
    backgroundColor: 'red',
  },
});
