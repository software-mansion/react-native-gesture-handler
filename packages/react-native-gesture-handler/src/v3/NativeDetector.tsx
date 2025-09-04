import React, {
  createContext,
  RefObject,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';
import { NativeGesture } from './hooks/useGesture';
import { Reanimated } from '../handlers/gestures/reanimatedWrapper';

import { Animated, StyleSheet } from 'react-native';
import HostGestureDetector from './HostGestureDetector';
import { invokeNullableMethod, tagMessage } from '../utils';
import { LogicDetectorProps } from './LogicDetector';

export interface NativeDetectorProps {
  children?: React.ReactNode;
  gesture: NativeGesture;
}

interface LogicMethods {
  onGestureHandlerEvent?: (e: any) => void;
  onGestureHandlerStateChange?: (e: any) => void;
  onGestureHandlerTouchEvent?: (e: any) => void;
}
const AnimatedNativeDetector =
  Animated.createAnimatedComponent(HostGestureDetector);

const ReanimatedNativeDetector =
  Reanimated?.default.createAnimatedComponent(HostGestureDetector);

type DetectorContextType = {
  register: (child: LogicDetectorProps, methods: LogicMethods) => void;
  unregister: (child: number | RefObject<Element | null>) => void;
};

const DetectorContext = createContext<DetectorContextType | null>(null);

export function NativeDetector({ gesture, children }: NativeDetectorProps) {
  const [logicChildren, setLogicChildren] = useState<LogicDetectorProps[]>([]);
  const logicMethods = useRef<Map<number, LogicMethods>>(new Map());

  const NativeDetectorComponent = gesture.config.dispatchesAnimatedEvents
    ? AnimatedNativeDetector
    : // TODO: Remove this cast when we properly type config
      (gesture.config.shouldUseReanimated as boolean)
      ? ReanimatedNativeDetector
      : HostGestureDetector;

  const register = useCallback(
    (child: LogicDetectorProps, methods: LogicMethods) => {
      if (child.viewTag !== -1) {
        setLogicChildren((prev) => {
          if (prev.some((c) => c.viewTag === child.viewTag)) {
            return prev;
          }
          return [...prev, child];
        });
      }
      logicMethods.current.set(child.viewTag, methods);
    },
    []
  );

  const unregister = useCallback(
    (childTag: number | RefObject<Element | null>) => {
      setLogicChildren((prev) => prev.filter((c) => c.viewTag !== childTag));
    },
    []
  );

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
        onGestureHandlerStateChange={
          gesture.gestureEvents.onGestureHandlerStateChange
        }
        onGestureHandlerEvent={gesture.gestureEvents.onGestureHandlerEvent}
        onGestureHandlerAnimatedEvent={
          gesture.gestureEvents.onGestureHandlerAnimatedEvent
        }
        onGestureHandlerTouchEvent={
          gesture.gestureEvents.onGestureHandlerTouchEvent
        }
        onGestureHandlerLogicEvent={(e) => {
          invokeNullableMethod(
            logicMethods.current.get(e.nativeEvent.childTag)
              ?.onGestureHandlerEvent,
            e
          );
        }}
        onGestureHandlerLogicStateChange={(e) => {
          invokeNullableMethod(
            logicMethods.current.get(e.nativeEvent.childTag)
              ?.onGestureHandlerStateChange,
            e
          );
        }}
        onGestureHandlerLogicTouchEvent={(e) => {
          invokeNullableMethod(
            logicMethods.current.get(e.nativeEvent.childTag)
              ?.onGestureHandlerTouchEvent,
            e
          );
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
