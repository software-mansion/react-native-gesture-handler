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
  animatedEvents: boolean;
}

export function useGesture(
  type: GestureType,
  fullConfig: Record<string, unknown>
): NativeGesture {
  const tag = useMemo(() => getNextHandlerTag(), []);

  const {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onGestureHandlerStateChange,
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
    // TODO: filter changes?
    RNGestureHandlerModule.updateGestureHandler(tag, config);
    RNGestureHandlerModule.flushOperations();
  }, [config, tag]);

  return {
    tag: tag,
    name: type,
    config: fullConfig,
    animatedEvents:
      !!onGestureHandlerEvent && '__isNative' in (onGestureHandlerEvent as any),
  };
}
