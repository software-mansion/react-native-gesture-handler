import React, { RefObject, useCallback, useRef, useState } from 'react';
import HostGestureDetector from '../HostGestureDetector';
import {
  LogicChildren,
  GestureHandlerEvent,
  DetectorCallbacks,
} from '../../types';
import { DetectorContext } from './useDetectorContext';
import { Reanimated } from '../../../handlers/gestures/reanimatedWrapper';
import { configureRelations, ensureNativeDetectorComponent } from '../utils';
import { isComposedGesture } from '../../hooks/utils/relationUtils';
import {
  AnimatedNativeDetector,
  InterceptingGestureDetectorProps,
  nativeDetectorStyles,
  ReanimatedNativeDetector,
} from '../common';
import { tagMessage } from '../../../utils';

export function InterceptingGestureDetector<THandlerData, TConfig>({
  gesture,
  children,
}: InterceptingGestureDetectorProps<THandlerData, TConfig>) {
  const [logicChildren, setLogicChildren] = useState<LogicChildren[]>([]);

  const logicMethods = useRef<
    Map<number, RefObject<DetectorCallbacks<unknown>>>
  >(new Map());

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
      methods: RefObject<DetectorCallbacks<unknown>>,
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

  const unregister = useCallback((childTag: number, handlerTags: number[]) => {
    handlerTags.forEach((tag) => {
      logicMethods.current.delete(tag);
    });

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

  const handleGestureEvent = (key: keyof DetectorCallbacks<THandlerData>) => {
    return (e: GestureHandlerEvent<THandlerData>) => {
      if (gesture?.detectorCallbacks[key]) {
        gesture.detectorCallbacks[key](e);
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
    (key: keyof DetectorCallbacks<unknown>) => {
      const handlers: ((e: GestureHandlerEvent<THandlerData>) => void)[] = [];

      if (gesture?.detectorCallbacks[key]) {
        handlers.push(
          gesture.detectorCallbacks[key] as (
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
    [logicChildren, gesture?.detectorCallbacks]
  );

  const reanimatedEventHandler = Reanimated!.useComposedEventHandler(
    getHandlers('onReanimatedUpdateEvent')
  );
  const reanimatedStateChangeHandler = Reanimated!.useComposedEventHandler(
    getHandlers('onReanimatedStateChange')
  );
  const reanimatedTouchEventHandler = Reanimated!.useComposedEventHandler(
    getHandlers('onReanimatedTouchEvent')
  );

  ensureNativeDetectorComponent(NativeDetectorComponent);

  if (gesture) {
    configureRelations(gesture);
  }

  return (
    <DetectorContext value={{ register, unregister }}>
      <NativeDetectorComponent
        // @ts-ignore This is a type mismatch between RNGH types and RN Codegen types
        onGestureHandlerStateChange={handleGestureEvent(
          'onGestureHandlerStateChange'
        )}
        // @ts-ignore This is a type mismatch between RNGH types and RN Codegen types
        onGestureHandlerEvent={handleGestureEvent('onGestureHandlerEvent')}
        // @ts-ignore This is a type mismatch between RNGH types and RN Codegen types
        onGestureHandlerAnimatedEvent={
          gesture?.detectorCallbacks.onGestureHandlerAnimatedEvent
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
    </DetectorContext>
  );
}
