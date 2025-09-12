import React, { RefObject, useCallback, useRef, useState } from 'react';
import { Reanimated } from '../handlers/gestures/reanimatedWrapper';
import { Animated, StyleSheet } from 'react-native';
import HostGestureDetector from './HostGestureDetector';
import { tagMessage } from '../utils';
import { LogicChildren, LogicMethods, NativeDetectorProps } from './types';
import { invokeDetectorEvent } from './hooks/utils';
import { DetectorContext } from './useDetectorContext';

const AnimatedNativeDetector =
  Animated.createAnimatedComponent(HostGestureDetector);

const ReanimatedNativeDetector =
  Reanimated?.default.createAnimatedComponent(HostGestureDetector);

export function NativeDetector({ gesture, children }: NativeDetectorProps) {
  const [logicChildren, setLogicChildren] = useState<LogicChildren[]>([]);
  const logicMethods = useRef<Map<number, RefObject<LogicMethods>>>(new Map());

  const NativeDetectorComponent = gesture.config.dispatchesAnimatedEvents
    ? AnimatedNativeDetector
    : // TODO: Remove this cast when we properly type config
      (gesture.config.shouldUseReanimated as boolean)
      ? ReanimatedNativeDetector
      : HostGestureDetector;

  const register = useCallback(
    (child: LogicChildren, methods: RefObject<LogicMethods>) => {
      setLogicChildren((prev) => {
        if (prev.some((c) => c.viewTag === child.viewTag)) {
          return prev;
        }
        return [...prev, child];
      });

      child.handlerTags.forEach((tag) => {
        logicMethods.current.set(tag, methods);
      });
    },
    []
  );

  const unregister = useCallback((childTag: number) => {
    setLogicChildren((prev) => prev.filter((c) => c.viewTag !== childTag));
  }, []);

  // It might happen only with ReanimatedNativeDetector
  if (!NativeDetectorComponent) {
    throw new Error(
      tagMessage(
        'Gesture expects to run on the UI thread, but failed to create the Reanimated NativeDetector.'
      )
    );
  }

  return (
    <DetectorContext.Provider value={{ register, unregister }}>
      <NativeDetectorComponent
        onGestureHandlerStateChange={(e) => {
          const method = !logicMethods.current.has(e.nativeEvent.handlerTag)
            ? gesture.gestureEvents.onGestureHandlerStateChange
            : logicMethods.current.get(e.nativeEvent.handlerTag)?.current
                ?.onGestureHandlerStateChange;
          invokeDetectorEvent(method, e);
        }}
        onGestureHandlerEvent={(e) => {
          const method = !logicMethods.current.has(e.nativeEvent.handlerTag)
            ? gesture.gestureEvents.onGestureHandlerEvent
            : logicMethods.current.get(e.nativeEvent.handlerTag)?.current
                ?.onGestureHandlerEvent;
          invokeDetectorEvent(method, e);
        }}
        onGestureHandlerAnimatedEvent={(e) => {
          const method = !logicMethods.current.has(e.nativeEvent.handlerTag)
            ? gesture.gestureEvents.onGestureHandlerAnimatedEvent
            : logicMethods.current.get(e.nativeEvent.handlerTag)?.current
                ?.onGestureHandlerAnimatedEvent;
          invokeDetectorEvent(method, e);
        }}
        onGestureHandlerTouchEvent={(e) => {
          const method = !logicMethods.current.has(e.nativeEvent.handlerTag)
            ? gesture.gestureEvents.onGestureHandlerTouchEvent
            : logicMethods.current.get(e.nativeEvent.handlerTag)?.current
                ?.onGestureHandlerTouchEvent;
          invokeDetectorEvent(method, e);
        }}
        onGestureHandlerReanimatedStateChange={(e) => {
          const method = !logicMethods.current.has(e.nativeEvent.handlerTag)
            ? gesture.gestureEvents.onReanimatedStateChange
            : logicMethods.current.get(e.nativeEvent.handlerTag)?.current
                ?.onReanimatedStateChange;
          invokeDetectorEvent(method, e);
        }}
        onGestureHandlerReanimatedEvent={(e) => {
          const method = !logicMethods.current.has(e.nativeEvent.handlerTag)
            ? gesture.gestureEvents.onReanimatedUpdateEvent
            : logicMethods.current.get(e.nativeEvent.handlerTag)?.current
                ?.onReanimatedUpdateEvent;
          invokeDetectorEvent(method, e);
        }}
        onGestureHandlerReanimatedTouchEvent={(e) => {
          const method = !logicMethods.current.has(e.nativeEvent.handlerTag)
            ? gesture.gestureEvents.onReanimatedTouchEvent
            : logicMethods.current.get(e.nativeEvent.handlerTag)?.current
                ?.onReanimatedTouchEvent;
          invokeDetectorEvent(method, e);
        }}
        moduleId={globalThis._RNGH_MODULE_ID}
        handlerTags={[gesture.tag]}
        style={styles.detector}
        logicChildren={logicChildren}>
        {children}
      </NativeDetectorComponent>
    </DetectorContext.Provider>
  );
}

const styles = StyleSheet.create({
  detector: {
    display: 'contents',
    // TODO: remove, debug info only
    backgroundColor: 'red',
  },
});
