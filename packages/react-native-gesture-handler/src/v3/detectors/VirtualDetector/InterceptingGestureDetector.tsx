import React, { useCallback, useEffect, useMemo, useState } from 'react';
import HostGestureDetector from '../HostGestureDetector';
import {
  VirtualChild,
  GestureHandlerEventWithHandlerData,
  DetectorCallbacks,
} from '../../types';
import {
  InterceptingDetectorContext,
  InterceptingDetectorContextValue,
  InterceptingDetectorMode,
} from './useInterceptingDetectorContext';
import { Reanimated } from '../../../handlers/gestures/reanimatedWrapper';
import { configureRelations, ensureNativeDetectorComponent } from '../utils';
import { isComposedGesture } from '../../hooks/utils/relationUtils';
import {
  AnimatedNativeDetector,
  InterceptingGestureDetectorProps,
  nativeDetectorStyles,
} from '../common';
import { tagMessage } from '../../../utils';
import { useEnsureGestureHandlerRootView } from '../useEnsureGestureHandlerRootView';
import { ReanimatedNativeDetector } from '../ReanimatedNativeDetector';

interface VirtualChildrenForNative {
  viewTag: number;
  handlerTags: number[];
  viewRef: unknown;
}

export function InterceptingGestureDetector<THandlerData, TConfig>({
  gesture,
  children,
}: InterceptingGestureDetectorProps<THandlerData, TConfig>) {
  useEnsureGestureHandlerRootView();

  const [virtualChildren, setVirtualChildren] = useState<Set<VirtualChild>>(
    () => new Set()
  );
  const virtualChildrenForNativeComponent: VirtualChildrenForNative[] = useMemo(
    () =>
      Array.from(virtualChildren).map((child) => ({
        viewTag: child.viewTag,
        handlerTags: child.handlerTags,
        viewRef: child.viewRef,
      })),
    [virtualChildren]
  );
  const [mode, setMode] = useState<InterceptingDetectorMode>(
    gesture?.config.shouldUseReanimatedDetector
      ? InterceptingDetectorMode.REANIMATED
      : gesture?.config.dispatchesAnimatedEvents
        ? InterceptingDetectorMode.ANIMATED
        : InterceptingDetectorMode.DEFAULT
  );

  const shouldUseReanimatedDetector =
    mode === InterceptingDetectorMode.REANIMATED;
  const dispatchesAnimatedEvents = mode === InterceptingDetectorMode.ANIMATED;

  const NativeDetectorComponent = dispatchesAnimatedEvents
    ? AnimatedNativeDetector
    : shouldUseReanimatedDetector
      ? ReanimatedNativeDetector
      : HostGestureDetector;

  const register = useCallback((child: VirtualChild) => {
    setVirtualChildren((prev) => {
      const newSet = new Set(prev);
      newSet.add(child);
      return newSet;
    });
  }, []);

  const unregister = useCallback((child: VirtualChild) => {
    setVirtualChildren((prev) => {
      const newSet = new Set(prev);
      newSet.delete(child);
      return newSet;
    });
  }, []);

  const contextValue: InterceptingDetectorContextValue = useMemo(
    () => ({
      mode,
      setMode: (newMode: InterceptingDetectorMode) => {
        if (
          (newMode === InterceptingDetectorMode.REANIMATED &&
            mode === InterceptingDetectorMode.ANIMATED) ||
          (newMode === InterceptingDetectorMode.ANIMATED &&
            mode === InterceptingDetectorMode.REANIMATED)
        ) {
          throw new Error(
            tagMessage(
              'InterceptingGestureDetector can only handle either Reanimated or Animated events.'
            )
          );
        }

        setMode(newMode);
      },
      register,
      unregister,
    }),
    [mode, register, unregister]
  );

  useEffect(() => {
    if (gesture?.config?.dispatchesAnimatedEvents) {
      contextValue.setMode(InterceptingDetectorMode.ANIMATED);
    } else if (gesture?.config?.shouldUseReanimatedDetector) {
      contextValue.setMode(InterceptingDetectorMode.REANIMATED);
    }
  }, [
    contextValue,
    gesture?.config?.dispatchesAnimatedEvents,
    gesture?.config?.shouldUseReanimatedDetector,
  ]);

  // It might happen only with ReanimatedNativeDetector
  if (!NativeDetectorComponent) {
    throw new Error(
      tagMessage(
        'Gesture expects to run on the UI thread, but failed to create the Reanimated NativeDetector.'
      )
    );
  }

  const createGestureEventHandler = useCallback(
    (key: keyof DetectorCallbacks<THandlerData>) => {
      return (e: GestureHandlerEventWithHandlerData<THandlerData>) => {
        if (typeof gesture?.detectorCallbacks[key] === 'function') {
          // @ts-expect-error passing event to a union of functions where only one is typed as such
          gesture.detectorCallbacks[key](e);
        }

        virtualChildren.forEach((child) => {
          const method = child.methods[key];
          if (typeof method === 'function') {
            // @ts-expect-error passing event to a union of functions where only one is typed as such
            method(e);
          }
        });
      };
    },
    [gesture, virtualChildren]
  );

  const getHandlers = useCallback(
    (key: keyof DetectorCallbacks<unknown>) => {
      const handlers: ((
        e: GestureHandlerEventWithHandlerData<THandlerData>
      ) => void)[] = [];

      if (gesture?.detectorCallbacks[key]) {
        handlers.push(
          gesture.detectorCallbacks[key] as (
            e: GestureHandlerEventWithHandlerData<unknown>
          ) => void
        );
      }

      virtualChildren.forEach((child) => {
        const handler = child.methods[key];
        if (handler) {
          handlers.push(
            handler as (
              e: GestureHandlerEventWithHandlerData<THandlerData>
            ) => void
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

  const handlerTags = useMemo(() => {
    if (gesture) {
      return isComposedGesture(gesture)
        ? gesture.handlerTags
        : [gesture.handlerTag];
    }
    return [];
  }, [gesture]);

  return (
    <InterceptingDetectorContext value={contextValue}>
      <NativeDetectorComponent
        pointerEvents={'box-none'}
        // @ts-ignore This is a type mismatch between RNGH types and RN Codegen types
        onGestureHandlerStateChange={useMemo(
          () => createGestureEventHandler('onGestureHandlerStateChange'),
          [createGestureEventHandler]
        )}
        // @ts-ignore This is a type mismatch between RNGH types and RN Codegen types
        onGestureHandlerEvent={useMemo(
          () => createGestureEventHandler('onGestureHandlerEvent'),
          [createGestureEventHandler]
        )}
        // @ts-ignore This is a type mismatch between RNGH types and RN Codegen types
        onGestureHandlerAnimatedEvent={
          gesture?.detectorCallbacks.onGestureHandlerAnimatedEvent
        }
        // @ts-ignore This is a type mismatch between RNGH types and RN Codegen types
        onGestureHandlerTouchEvent={useMemo(
          () => createGestureEventHandler('onGestureHandlerTouchEvent'),
          [createGestureEventHandler]
        )}
        // @ts-ignore This is a type mismatch between RNGH types and RN Codegen types
        onGestureHandlerReanimatedStateChange={
          shouldUseReanimatedDetector ? reanimatedStateChangeHandler : undefined
        }
        // @ts-ignore This is a type mismatch between RNGH types and RN Codegen types
        onGestureHandlerReanimatedEvent={
          shouldUseReanimatedDetector ? reanimatedEventHandler : undefined
        }
        // @ts-ignore This is a type mismatch between RNGH types and RN Codegen types
        onGestureHandlerReanimatedTouchEvent={
          shouldUseReanimatedDetector ? reanimatedTouchEventHandler : undefined
        }
        handlerTags={handlerTags}
        style={nativeDetectorStyles.detector}
        virtualChildren={virtualChildrenForNativeComponent}
        moduleId={globalThis._RNGH_MODULE_ID}>
        {children}
      </NativeDetectorComponent>
    </InterceptingDetectorContext>
  );
}
