import { useGestureStateChangeEvent } from './events/useGestureStateChangeEvent';
import { useGestureHandlerEvent } from './events/useGestureHandlerEvent';
import { useTouchEvent } from './events/useTouchEvent';

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

  const onGestureHandlerAnimatedEvent =
    config.onGestureHandlerAnimatedEvent as (...args: any[]) => void;

  return {
    onGestureHandlerStateChange,
    onGestureHandlerEvent,
    onGestureHandlerTouchEvent,
    onGestureHandlerAnimatedEvent,
  };
}
