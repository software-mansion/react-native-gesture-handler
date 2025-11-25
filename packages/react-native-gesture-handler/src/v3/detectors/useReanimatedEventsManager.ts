import { useEffect, useMemo, useRef } from 'react';
import { Gesture } from '../types';
import { findNodeHandle } from 'react-native';
// TODO: import from reanimatedWrapper
import { NativeEventsManager } from 'react-native-reanimated/src/createAnimatedComponent/NativeEventsManager';

// TODO: web
export function useReanimatedEventsManager<THandlerData, TConfig>(
  gesture: Gesture<THandlerData, TConfig>
) {
  const prevProps = useRef<any>(null);
  const eventManager = useRef<any>(null);
  const viewRef = useRef<any>(null);

  const reaProps = useMemo(
    () => ({
      onGestureHandlerReanimatedStateChange:
        gesture.detectorCallbacks.onReanimatedStateChange,
      // @ts-ignore This is a type mismatch between RNGH types and RN Codegen types
      onGestureHandlerReanimatedEvent:
        gesture.detectorCallbacks.onReanimatedUpdateEvent,
      // @ts-ignore This is a type mismatch between RNGH types and RN Codegen types
      onGestureHandlerReanimatedTouchEvent:
        gesture.detectorCallbacks.onReanimatedTouchEvent,
    }),
    [
      gesture.detectorCallbacks.onReanimatedStateChange,
      gesture.detectorCallbacks.onReanimatedTouchEvent,
      gesture.detectorCallbacks.onReanimatedUpdateEvent,
    ]
  );

  useEffect(() => {
    const nativeTag = findNodeHandle(viewRef.current) ?? -1;
    viewRef.__nativeTag = nativeTag;
    eventManager.current = new NativeEventsManager({
      props: reaProps,
      _componentRef: viewRef,
      getComponentViewTag: () => {
        return nativeTag;
      },
    });
    eventManager.current.attachEvents();

    return () => {
      eventManager.current.detachEvents();
    };
  }, []);

  useEffect(() => {
    if (prevProps.current) {
      eventManager.current.updateEvents(prevProps.current);
    }
    prevProps.current = reaProps;
  }, [reaProps]);

  return viewRef;
}
