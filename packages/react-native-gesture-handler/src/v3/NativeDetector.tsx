import React, {
  createContext,
  RefObject,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';
import { Reanimated } from '../handlers/gestures/reanimatedWrapper';
import { Animated, StyleSheet } from 'react-native';
import HostGestureDetector from './HostGestureDetector';
import { tagMessage } from '../utils';
import { LogicDetectorProps, LogicMethods, NativeDetectorProps } from './types';

const AnimatedNativeDetector =
  Animated.createAnimatedComponent(HostGestureDetector);

const ReanimatedNativeDetector =
  Reanimated?.default.createAnimatedComponent(HostGestureDetector);

type DetectorContextType = {
  register: (
    child: LogicDetectorProps,
    methods: RefObject<LogicMethods>
  ) => void;
  unregister: (child: number) => void;
};

const DetectorContext = createContext<DetectorContextType | null>(null);

export function NativeDetector({ gesture, children }: NativeDetectorProps) {
  const [logicChildren, setLogicChildren] = useState<LogicDetectorProps[]>([]);
  const logicMethods = useRef<Map<number, RefObject<LogicMethods>>>(new Map());

  const NativeDetectorComponent = gesture.config.dispatchesAnimatedEvents
    ? AnimatedNativeDetector
    : // TODO: Remove this cast when we properly type config
      (gesture.config.shouldUseReanimated as boolean)
      ? ReanimatedNativeDetector
      : HostGestureDetector;

  const register = useCallback(
    (child: LogicDetectorProps, methods: RefObject<LogicMethods>) => {
      if (child.viewTag !== -1) {
        setLogicChildren((prev) => {
          if (prev.some((c) => c.viewTag === child.viewTag)) {
            return prev;
          }
          return [...prev, child];
        });
      }
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
          if (method) {
            method(e);
          }
        }}
        onGestureHandlerEvent={(e) => {
          const method = !logicMethods.current.has(e.nativeEvent.handlerTag)
            ? gesture.gestureEvents.onGestureHandlerEvent
            : logicMethods.current.get(e.nativeEvent.handlerTag)?.current
                ?.onGestureHandlerEvent;
          if (method) {
            method(e);
          }
        }}
        onGestureHandlerAnimatedEvent={
          gesture.gestureEvents.onGestureHandlerAnimatedEvent
        }
        onGestureHandlerTouchEvent={(e) => {
          const method = !logicMethods.current.has(e.nativeEvent.handlerTag)
            ? gesture.gestureEvents.onGestureHandlerTouchEvent
            : logicMethods.current.get(e.nativeEvent.handlerTag)?.current
                ?.onGestureHandlerTouchEvent;
          if (method) {
            method(e);
          }
        }}
        onGestureHandlerReanimatedStateChange={(e) => {
          const method = !logicMethods.current.has(e.nativeEvent.handlerTag)
            ? gesture.gestureEvents.onReanimatedStateChange
            : logicMethods.current.get(e.nativeEvent.handlerTag)?.current
                ?.onReanimatedStateChange;
          if (method) {
            method(e);
          }
        }}
        onGestureHandlerReanimatedEvent={(e) => {
          const method = !logicMethods.current.has(e.nativeEvent.handlerTag)
            ? gesture.gestureEvents.onReanimatedUpdateEvent
            : logicMethods.current.get(e.nativeEvent.handlerTag)?.current
                ?.onReanimatedUpdateEvent;
          if (method) {
            method(e);
          }
        }}
        onGestureHandlerReanimatedTouchEvent={(e) => {
          const method = !logicMethods.current.has(e.nativeEvent.handlerTag)
            ? gesture.gestureEvents.onReanimatedTouchEvent
            : logicMethods.current.get(e.nativeEvent.handlerTag)?.current
                ?.onReanimatedTouchEvent;
          if (method) {
            method(e);
          }
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

export function useDetectorContext() {
  const ctx = useContext(DetectorContext);
  if (!ctx) {
    throw new Error('Logic detector must be under a Native Detector');
  }
  return ctx;
}

const styles = StyleSheet.create({
  detector: {
    display: 'contents',
    // TODO: remove, debug info only
    backgroundColor: 'red',
  },
});
