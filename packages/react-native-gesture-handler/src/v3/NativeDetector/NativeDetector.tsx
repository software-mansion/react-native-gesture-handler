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
import {
  configureRelations,
  getHandlerTag,
  invokeDetectorEvent,
} from './utils';
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

  const handleGestureEvent = (
    key: keyof GestureEvents<unknown>,
    e: GestureHandlerEvent<unknown>
  ) => {
    const handlerTag = getHandlerTag(e);
    const method = !logicMethods.current.has(handlerTag)
      ? gesture.gestureEvents[key]
      : logicMethods.current.get(handlerTag)?.current?.[key];
    invokeDetectorEvent(method as (e: GestureHandlerEvent<unknown>) => void, e);
  };

  return (
    <DetectorContext.Provider value={{ register, unregister }}>
      <NativeDetectorComponent
        onGestureHandlerStateChange={(e) => {
          // @ts-ignore This is a type mismatch between RNGH types and RN Codegen types
          handleGestureEvent('onGestureHandlerStateChange', e);
        }}
        onGestureHandlerEvent={(e) => {
          // @ts-ignore This is a type mismatch between RNGH types and RN Codegen types
          handleGestureEvent('onGestureHandlerEvent', e);
        }}
        onGestureHandlerAnimatedEvent={(e) => {
          // @ts-ignore This is a type mismatch between RNGH types and RN Codegen types
          handleGestureEvent('onGestureHandlerAnimatedEvent', e);
        }}
        onGestureHandlerTouchEvent={(e) => {
          // @ts-ignore This is a type mismatch between RNGH types and RN Codegen types
          handleGestureEvent('onGestureHandlerTouchEvent', e);
        }}
        onGestureHandlerReanimatedStateChange={(e) => {
          // @ts-ignore This is a type mismatch between RNGH types and RN Codegen types
          handleGestureEvent('onReanimatedStateChange', e);
        }}
        onGestureHandlerReanimatedEvent={(e) => {
          // @ts-ignore This is a type mismatch between RNGH types and RN Codegen types
          handleGestureEvent('onReanimatedUpdateEvent', e);
        }}
        onGestureHandlerReanimatedTouchEvent={(e) => {
          // @ts-ignore This is a type mismatch between RNGH types and RN Codegen types
          handleGestureEvent('onReanimatedTouchEvent', e);
        }}
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
