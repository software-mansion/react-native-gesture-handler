import { useGestureStateChangeEvent } from './callbacks/js/useGestureStateChangeEvent';
import { useGestureUpdateEvent } from './callbacks/js/useGestureUpdateEvent';
import { useGestureTouchEvent } from './callbacks/js/useGestureTouchEvent';
import { AnimatedEvent } from '../types';
import { checkMappingForChangeProperties, isAnimatedEvent } from './utils';

export function useGestureCallbacks(handlerTag: number, config: any) {
  const onGestureHandlerStateChange = useGestureStateChangeEvent(
    handlerTag,
    config
  );

  const onGestureHandlerEvent = useGestureUpdateEvent(handlerTag, config);
  const onGestureHandlerTouchEvent = useGestureTouchEvent(handlerTag, config);
  let onGestureHandlerAnimatedEvent: AnimatedEvent | undefined;
  if (isAnimatedEvent(config.onUpdate)) {
    for (const mapping of config.onUpdate._argMapping) {
      checkMappingForChangeProperties(mapping);
    }

    // TODO: Remove cast when config is properly typed.
    onGestureHandlerAnimatedEvent = config.onUpdate as AnimatedEvent;
  }

  return {
    onGestureHandlerStateChange,
    onGestureHandlerEvent,
    onGestureHandlerTouchEvent,
    onGestureHandlerAnimatedEvent,
  };
}
