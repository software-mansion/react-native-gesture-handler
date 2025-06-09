import { useEffect, useLayoutEffect, useMemo } from 'react';
import { getNextHandlerTag } from '../getNextHandlerTag';
import RNGestureHandlerModule from '../../RNGestureHandlerModule';
import { usePreviousValue } from './usePreviousValue';
import { _NativeGesture, BaseConfigObjectType, GestureName } from './types';
import { getNewDiffValues } from './utils';

export function useGesture<TConfig, TPayload extends Record<string, unknown>>(
  type: GestureName,
  config: BaseConfigObjectType<TPayload> & TConfig
): _NativeGesture<TConfig> {
  const tag = useMemo(() => getNextHandlerTag(), []);
  const previousConfig = usePreviousValue(config);

  useLayoutEffect(() => {
    RNGestureHandlerModule.createGestureHandler(type, tag, {});
    RNGestureHandlerModule.flushOperations();

    return () => {
      RNGestureHandlerModule.dropGestureHandler(tag);
      RNGestureHandlerModule.flushOperations();
    };
  }, [type, tag]);

  useEffect(() => {
    const diff = getNewDiffValues(previousConfig, config);
    console.log(diff);

    RNGestureHandlerModule.updateGestureHandler(tag, config);
    RNGestureHandlerModule.flushOperations();
  }, [previousConfig, config, tag]);

  return { tag, name: type, config };
}
