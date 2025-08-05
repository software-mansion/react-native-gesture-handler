import { useGestureStateChangeEvent } from './events/useGestureStateChangeEvent';
import { useGestureHandlerEvent } from './events/useGestureHandlerEvent';
import { useTouchEvent } from './events/useTouchEvent';
import { AnimatedEvent } from '../types';
import { checkMappingForChangeProperties, isAnimatedEvent } from './utils';

export function useGestureEvent(handlerTag: number, config: any) {
  const onGestureHandlerStateChange = useGestureStateChangeEvent(
    handlerTag,
    config
  );
  const onGestureHandlerEvent = useGestureHandlerEvent(handlerTag, config);

  const onGestureHandlerTouchEvent = useTouchEvent(handlerTag, config);

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
