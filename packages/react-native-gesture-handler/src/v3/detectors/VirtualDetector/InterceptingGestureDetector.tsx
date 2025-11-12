import React, { useCallback, useMemo, useState } from 'react';
import HostGestureDetector from '../HostGestureDetector';
import {
  VirtualChild,
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
  const [virtualChildren, setVirtualChildren] = useState<VirtualChild[]>([]);

  const shouldUseReanimated = useMemo(
    () =>
      virtualChildren.reduce(
        (acc, child) => acc || child.forReanimated,
        gesture?.config.shouldUseReanimatedDetector ?? false
      ),
    [virtualChildren, gesture]
  );

  const dispatchesAnimatedEvents = useMemo(
    () =>
      virtualChildren.reduce(
        (acc, child) => acc || child.forAnimated,
        gesture?.config.dispatchesAnimatedEvents ?? false
      ),
    [virtualChildren, gesture]
  );

  const NativeDetectorComponent = dispatchesAnimatedEvents
    ? AnimatedNativeDetector
    : shouldUseReanimated
      ? ReanimatedNativeDetector
      : HostGestureDetector;

  const register = useCallback((child: VirtualChild) => {
    setVirtualChildren((prev) => {
      const index = prev.findIndex((c) => c.viewTag === child.viewTag);
      if (index !== -1) {
        const updated = [...prev];
        updated[index] = child;
        return updated;
      }

      return [...prev, child];
    });
  }, []);

  const unregister = useCallback((childTag: number) => {
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

      virtualChildren.forEach((child) => {
        const method = child.methods[key];
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

      virtualChildren.forEach((child) => {
        const handler = child.methods[key];
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

  const reanimatedUpdateEvents = useMemo(
    () => getHandlers('onReanimatedUpdateEvent'),
    [getHandlers]
  );
  const reanimatedEventHandler = Reanimated?.useComposedEventHandler(
    reanimatedUpdateEvents
  );

  const reanimatedStateChangeEvents = useMemo(
    () => getHandlers('onReanimatedStateChange'),
    [getHandlers]
  );
  const reanimatedStateChangeHandler = Reanimated?.useComposedEventHandler(
    reanimatedStateChangeEvents
  );

  const reanimatedTouchEvents = useMemo(
    () => getHandlers('onReanimatedTouchEvent'),
    [getHandlers]
  );
  const reanimatedTouchEventHandler = Reanimated?.useComposedEventHandler(
    reanimatedTouchEvents
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
