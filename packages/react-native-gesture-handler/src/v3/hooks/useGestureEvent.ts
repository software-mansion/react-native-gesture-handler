import { useGestureStateChangeEvent } from './events/useGestureStateChangeEvent';
import { useGestureHandlerEvent } from './events/useGestureHandlerEvent';
import { useTouchEvent } from './events/useTouchEvent';
import { AnimatedEvent } from '../types';
import { checkMappingForChangeProperties, isAnimatedEvent } from './utils';

export function useGestureEvent(
  handlerTag: number,
  config: any,
  shouldUseReanimated: boolean
) {
  const onGestureHandlerStateChange = useGestureStateChangeEvent(
    handlerTag,
    config,
    shouldUseReanimated
  );
  const onGestureHandlerEvent = useGestureHandlerEvent(
    handlerTag,
    config,
    shouldUseReanimated
  );

  const onGestureHandlerTouchEvent = useTouchEvent(
    handlerTag,
    config,
    shouldUseReanimated
  );

  // TODO: Assign `onGestureHandlerAnimatedEvent` automatically when user passes `onUpdate` callback as Animated.Event
  // Also throw error when someone uses `change*` properties with Animated Event in `onUpdate`

  let onGestureHandlerAnimatedEvent: AnimatedEvent | undefined;

  if (isAnimatedEvent(config.onUpdate)) {
    for (const mapping of config.onUpdate._argMapping) {
      checkMappingForChangeProperties(mapping);
    }

    onGestureHandlerAnimatedEvent = config.onUpdate as AnimatedEvent;
  }

  return {
    onGestureHandlerStateChange,
    onGestureHandlerEvent,
    onGestureHandlerTouchEvent,
    onGestureHandlerAnimatedEvent,
  };
}
