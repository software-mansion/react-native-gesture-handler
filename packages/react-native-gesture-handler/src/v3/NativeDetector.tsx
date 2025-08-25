import React, { createContext, useCallback, useContext, useState } from 'react';
import { NativeGesture } from './hooks/useGesture';
import { Reanimated } from '../handlers/gestures/reanimatedWrapper';

import { Animated, StyleSheet } from 'react-native';
import HostGestureDetector from './HostGestureDetector';
import { tagMessage } from '../utils';
import { LogicChild } from '../web/interfaces';

export interface NativeDetectorProps {
  children?: React.ReactNode;
  gesture: NativeGesture;
}

const AnimatedNativeDetector =
  Animated.createAnimatedComponent(HostGestureDetector);

const ReanimatedNativeDetector =
  Reanimated?.default.createAnimatedComponent(HostGestureDetector);

type DetectorContextType = {
  register: (child: LogicChild) => void;
  unregister: (child: LogicChild) => void;
};

const DetectorContext = createContext<DetectorContextType | null>(null);

export function NativeDetector({ gesture, children }: NativeDetectorProps) {
  const [logicChildren, setLogicChildren] = useState<Set<LogicChild>>(
    new Set()
  );
  const NativeDetectorComponent = gesture.config.dispatchesAnimatedEvents
    ? AnimatedNativeDetector
    : // TODO: Remove this cast when we properly type config
      (gesture.config.shouldUseReanimated as boolean)
      ? ReanimatedNativeDetector
      : HostGestureDetector;

  const register = useCallback((child: LogicChild) => {
    setLogicChildren((prev) => new Set(prev).add(child));
  }, []);

  const unregister = useCallback((child: LogicChild) => {
    setLogicChildren((prev) => {
      const updated = new Set(prev);
      updated.delete(child);
      return updated;
    });
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
