import React, { RefObject, useCallback, useRef, useState } from 'react';
import HostGestureDetector from '../HostGestureDetector';
import { LogicChildren, GestureEvents, GestureHandlerEvent } from '../../types';
import { DetectorContext } from './useDetectorContext';
import { Reanimated } from '../../../handlers/gestures/reanimatedWrapper';
import { configureRelations, ensureNativeDetectorComponent } from '../utils';
import { isComposedGesture } from '../../hooks/utils/relationUtils';
import {
  AnimatedNativeDetector,
  GestureDetectorBoundaryProps,
  nativeDetectorStyles,
  ReanimatedNativeDetector,
} from '../common';

export function GestureDetectorBoundary<THandlerData, TConfig>({
  gesture,
  children,
}: GestureDetectorBoundaryProps<THandlerData, TConfig>) {
  const [logicChildren, setLogicChildren] = useState<LogicChildren[]>([]);
  const logicMethods = useRef<Map<number, RefObject<GestureEvents<unknown>>>>(
    new Map()
  );
  const [shouldUseReanimated, setShouldUseReanimated] = useState(
    gesture ? gesture.config.shouldUseReanimatedDetector : false
  );
  const [dispatchesAnimatedEvents, setDispatchesAnimatedEvents] = useState(
    gesture ? gesture.config.dispatchesAnimatedEvents : false
  );

  const NativeDetectorComponent = dispatchesAnimatedEvents
    ? AnimatedNativeDetector
    : shouldUseReanimated
      ? ReanimatedNativeDetector
      : HostGestureDetector;

  const register = useCallback(
    (
      child: LogicChildren,
      methods: RefObject<GestureEvents<unknown>>,
      forReanimated: boolean | undefined,
      forAnimated: boolean | undefined
    ) => {
      setShouldUseReanimated(!!forReanimated);
      setDispatchesAnimatedEvents(!!forAnimated);

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

  const handleGestureEvent = (key: keyof GestureEvents<THandlerData>) => {
    return (e: GestureHandlerEvent<THandlerData>) => {
      if (gesture?.gestureEvents[key]) {
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

      if (gesture?.gestureEvents[key]) {
        handlers.push(
          gesture.gestureEvents[key] as (
            e: GestureHandlerEvent<unknown>
          ) => void
        );
      }

      logicMethods.current.forEach((ref) => {
        const handler = ref.current?.[key];
        if (handler) {
          handlers.push(
            handler as (e: GestureHandlerEvent<THandlerData>) => void
          );
        }
      });

      return handlers;
    },
    [logicChildren, gesture?.gestureEvents]
  );

  const reanimatedEventHandler = Reanimated?.useComposedEventHandler(
    getHandlers('onReanimatedUpdateEvent')
  );
  const reanimatedStateChangeHandler = Reanimated?.useComposedEventHandler(
    getHandlers('onReanimatedStateChange')
  );
  const reanimatedTouchEventHandler = Reanimated?.useComposedEventHandler(
    getHandlers('onReanimatedTouchEvent')
  );

  ensureNativeDetectorComponent(NativeDetectorComponent);

  if (gesture) {
    configureRelations(gesture);
  }

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
        onGestureHandlerAnimatedEvent={
          gesture?.gestureEvents.onGestureHandlerAnimatedEvent
        }
        // @ts-ignore This is a type mismatch between RNGH types and RN Codegen types
        onGestureHandlerTouchEvent={handleGestureEvent(
          'onGestureHandlerTouchEvent'
        )}
        // @ts-ignore This is a type mismatch between RNGH types and RN Codegen types
        onGestureHandlerReanimatedStateChange={reanimatedEventHandler}
        // @ts-ignore This is a type mismatch between RNGH types and RN Codegen types
        onGestureHandlerReanimatedEvent={reanimatedStateChangeHandler}
        // @ts-ignore This is a type mismatch between RNGH types and RN Codegen types
        onGestureHandlerReanimatedTouchEvent={reanimatedTouchEventHandler}
        moduleId={globalThis._RNGH_MODULE_ID}
        handlerTags={
          gesture
            ? isComposedGesture(gesture)
              ? gesture.tags
              : [gesture.tag]
            : []
        }
        style={nativeDetectorStyles.detector}
        logicChildren={logicChildren}>
        {children}
      </NativeDetectorComponent>
    </DetectorContext.Provider>
  );
}
