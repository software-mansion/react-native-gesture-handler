import React, { RefObject, useCallback, useRef, useState } from 'react';
import { Animated, StyleSheet } from 'react-native';
import HostGestureDetector from './HostGestureDetector';
import { tagMessage } from '../../utils';
import {
  LogicChildren,
  Gesture,
  GestureEvents,
  GestureHandlerEvent,
} from '../types';
import { DetectorContext } from './useDetectorContext';
import { Reanimated } from '../../handlers/gestures/reanimatedWrapper';
import { configureRelations } from './utils';
import { isComposedGesture } from '../hooks/utils/relationUtils';

export interface NativeDetectorProps {
  children?: React.ReactNode;
  gesture: Gesture;
}

const AnimatedNativeDetector =
  Animated.createAnimatedComponent(HostGestureDetector);

const ReanimatedNativeDetector =
  Reanimated?.default.createAnimatedComponent(HostGestureDetector);

export function NativeDetector({ gesture, children }: NativeDetectorProps) {
  const [logicChildren, setLogicChildren] = useState<LogicChildren[]>([]);
  const logicMethods = useRef<Map<number, RefObject<GestureEvents<unknown>>>>(
    new Map()
  );

  const NativeDetectorComponent = gesture.config.dispatchesAnimatedEvents
    ? AnimatedNativeDetector
    : gesture.config.shouldUseReanimated
      ? ReanimatedNativeDetector
      : HostGestureDetector;

  const register = useCallback(
    (child: LogicChildren, methods: RefObject<GestureEvents<unknown>>) => {
      setLogicChildren((prev) => {
        const index = prev.findIndex((c) => c.viewTag === child.viewTag);
        if (index !== -1) {
          const updated = [...prev];
          updated[index] = child;
          return updated;
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

  configureRelations(gesture);

  const handleGestureEvent = (key: keyof GestureEvents<unknown>) => {
    return (e: GestureHandlerEvent<unknown>) => {
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
      const handlers: ((e: GestureHandlerEvent<unknown>) => void)[] = [];

      if (gesture.gestureEvents[key]) {
        handlers.push(
          gesture.gestureEvents[key] as (
            e: GestureHandlerEvent<unknown>
          ) => void
        );
      }

      logicMethods.current.forEach((ref) => {
        const handler = ref.current?.[key];
        if (handler) {
          handlers.push(handler as (e: GestureHandlerEvent<unknown>) => void);
        }
      });

      return handlers;
    },
    [logicChildren, gesture.gestureEvents]
  );

  const reanimatedEventHandler = Reanimated?.useComposedEventHandler(
    getHandlers('onReanimatedUpdateEvent')
  );
  const reanimedStateChangeHandler = Reanimated?.useComposedEventHandler(
    getHandlers('onReanimatedStateChange')
  );
  const reanimatedTouchEventHandler = Reanimated?.useComposedEventHandler(
    getHandlers('onReanimatedTouchEvent')
  );

  return (
    <DetectorContext.Provider value={{ register, unregister }}>
      <NativeDetectorComponent
        // @ts-ignore This is a type mismatch between RNGH types and RN Codegen types
        onGestureHandlerStateChange={handleGestureEvent(
          'onGestureHandlerStateChange'
        )}
        // @ts-ignore This is a type mismatch between RNGH types and RN Codegen types
        onGestureHandlerEvent={handleGestureEvent('onGestureHandlerEvent')}
        // @ts-ignore This is a type mismatch between RNGH types and RN Codegen types
        onGestureHandlerAnimatedEvent={handleGestureEvent(
          'onGestureHandlerAnimatedEvent'
        )}
        // @ts-ignore This is a type mismatch between RNGH types and RN Codegen types
        onGestureHandlerTouchEvent={handleGestureEvent(
          'onGestureHandlerTouchEvent'
        )}
        // @ts-ignore This is a type mismatch between RNGH types and RN Codegen types
        onGestureHandlerReanimatedStateChange={reanimatedEventHandler}
        // @ts-ignore This is a type mismatch between RNGH types and RN Codegen types
        onGestureHandlerReanimatedEvent={reanimedStateChangeHandler}
        // @ts-ignore This is a type mismatch between RNGH types and RN Codegen types
        onGestureHandlerReanimatedTouchEvent={reanimatedTouchEventHandler}
        moduleId={globalThis._RNGH_MODULE_ID}
        handlerTags={isComposedGesture(gesture) ? gesture.tags : [gesture.tag]}
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
