import React, { useCallback, useRef, useState } from 'react';
import HostGestureDetector from '../HostGestureDetector';
import {
  VirtualChildren,
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
  const [virtualChildren, setVirtualChildren] = useState<VirtualChildren[]>([]);

  const virtualMethods = useRef<Map<number, DetectorCallbacks<unknown>>>(
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
      child: VirtualChildren,
      methods: DetectorCallbacks<unknown>,
      forReanimated: boolean | undefined,
      forAnimated: boolean | undefined
    ) => {
      // console.log('[IGD] Registering virtual detector', child.viewTag, child.handlerTags);
      setShouldUseReanimated(!!forReanimated);
      setDispatchesAnimatedEvents(!!forAnimated);

      setVirtualChildren((prev) => {
        const index = prev.findIndex((c) => c.viewTag === child.viewTag);
        if (index !== -1) {
          const updated = [...prev];
          updated[index] = child;
          return updated;
        }

        return [...prev, child];
      });

      child.handlerTags.forEach((tag) => {
        virtualMethods.current.set(tag, methods);
      });
    },
    []
  );

  const unregister = useCallback((childTag: number, handlerTags: number[]) => {
    // console.log('[IGD] Unregistering virtual detector', childTag, handlerTags);
    handlerTags.forEach((tag) => {
      virtualMethods.current.delete(tag);
    });

    setVirtualChildren((prev) => prev.filter((c) => c.viewTag !== childTag));
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

      virtualMethods.current.forEach((callbacks) => {
        const method = callbacks[key];
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

      virtualMethods.current.forEach((callbacks) => {
        const handler = callbacks[key];
        if (handler) {
          handlers.push(
            handler as (e: GestureHandlerEvent<THandlerData>) => void
          );
        }
      });

      return handlers;
    },
    [virtualChildren, gesture?.detectorCallbacks]
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
        onGestureHandlerReanimatedStateChange={
          shouldUseReanimated ? reanimatedStateChangeHandler : undefined
        }
        // @ts-ignore This is a type mismatch between RNGH types and RN Codegen types
        onGestureHandlerReanimatedEvent={
          shouldUseReanimated ? reanimatedEventHandler : undefined
        }
        // @ts-ignore This is a type mismatch between RNGH types and RN Codegen types
        onGestureHandlerReanimatedTouchEvent={
          shouldUseReanimated ? reanimatedTouchEventHandler : undefined
        }
        handlerTags={
          gesture
            ? isComposedGesture(gesture)
              ? gesture.tags
              : [gesture.tag]
            : []
        }
        style={nativeDetectorStyles.detector}
        virtualChildren={virtualChildren}
        moduleId={globalThis._RNGH_MODULE_ID}>
        {children}
      </NativeDetectorComponent>
    </DetectorContext>
  );
}
