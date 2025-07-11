import { useEffect, useMemo } from 'react';
import { getNextHandlerTag } from './handlers/getNextHandlerTag';
import RNGestureHandlerModule from './RNGestureHandlerModule';

type GestureType =
  | 'TapGestureHandler'
  | 'LongPressGestureHandler'
  | 'PanGestureHandler'
  | 'PinchGestureHandler'
  | 'RotationGestureHandler'
  | 'FlingGestureHandler'
  | 'ForceTouchGestureHandler'
  | 'ManualGestureHandler'
  | 'NativeViewGestureHandler';

export interface NativeGesture {
  tag: number;
  name: GestureType;
  config: Record<string, unknown>;
  dispatchAnimatedEvents: boolean;
}

export function useGesture(
  type: GestureType,
  fullConfig: Record<string, unknown>
): NativeGesture {
  const tag = useMemo(() => getNextHandlerTag(), []);

  const {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onGestureHandlerStateChange,
    onGestureHandlerAnimatedEvent,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onGestureHandlerEvent,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onGestureHandlerTouchEvent,
    ...config
  } = fullConfig;

  useMemo(() => {
    RNGestureHandlerModule.createGestureHandler(type, tag, {});
    RNGestureHandlerModule.flushOperations();
  }, [type, tag]);

  useEffect(() => {
    return () => {
      RNGestureHandlerModule.dropGestureHandler(tag);
      RNGestureHandlerModule.flushOperations();
    };
  }, [type, tag]);

  useEffect(() => {
    // TODO: filter changes - passing functions (and possibly other types)
    // causes a native crash
    RNGestureHandlerModule.updateGestureHandler(tag, config);
    RNGestureHandlerModule.flushOperations();
  }, [config, tag]);

  return {
    tag: tag,
    name: type,
    config: fullConfig,
    dispatchAnimatedEvents:
      !!onGestureHandlerAnimatedEvent &&
      '__isNative' in (onGestureHandlerAnimatedEvent as any),
  };
}
