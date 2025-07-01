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
}

export function useGesture(
  type: GestureType,
  config: Record<string, unknown>
): NativeGesture {
  const tag = useMemo(() => getNextHandlerTag(), []);

  useMemo(() => {
    RNGestureHandlerModule.createGestureHandler(type, tag, {});
    RNGestureHandlerModule.flushOperations();
  }, [])

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

  return { tag: tag, name: type, config };
}
