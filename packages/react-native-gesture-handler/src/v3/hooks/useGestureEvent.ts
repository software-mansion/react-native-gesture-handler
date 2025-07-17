import { useGestureStateChangeEvent } from './events/useGestureStateChangeEvent';
import { useGestureHandlerEvent } from './events/useGestureHandlerEvent';
import { useTouchEvent } from './events/useTouchEvent';

export function useGestureEvent(config: any, shouldUseReanimated: boolean) {
  const onGestureHandlerStateChange = useGestureStateChangeEvent(
    config,
    shouldUseReanimated
  );
  const onGestureHandlerEvent = useGestureHandlerEvent(
    config,
    shouldUseReanimated
  );

  const onGestureHandlerTouchEvent = useTouchEvent(config, shouldUseReanimated);

  const onGestureHandlerAnimatedEvent = config.onGestureHandlerAnimatedEvent;

  return {
    onGestureHandlerStateChange,
    onGestureHandlerEvent,
    onGestureHandlerTouchEvent,
    onGestureHandlerAnimatedEvent,
  };
}
