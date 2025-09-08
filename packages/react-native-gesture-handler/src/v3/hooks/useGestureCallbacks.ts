import { useGestureStateChangeEvent } from './callbacks/js/useGestureStateChangeEvent';
import { useGestureUpdateEvent } from './callbacks/js/useGestureUpdateEvent';
import { useGestureTouchEvent } from './callbacks/js/useGestureTouchEvent';
import { AnimatedEvent } from '../types';
import { checkMappingForChangeProperties, isAnimatedEvent } from './utils';
import { useReanimatedStateChangeEvent } from './callbacks/reanimated/useReanimatedStateChangeEvent';
import { useReanimatedUpdateEvent } from './callbacks/reanimated/useReanimatedUpdateEvent';
import { useReanimatedTouchEvent } from './callbacks/reanimated/useReanimatedTouchEvent';

export function useGestureCallbacks(handlerTag: number, config: any) {
  const onGestureHandlerStateChange = useGestureStateChangeEvent(
    handlerTag,
    config
  );
  const onGestureHandlerEvent = useGestureUpdateEvent(handlerTag, config);
  const onGestureHandlerTouchEvent = useGestureTouchEvent(handlerTag, config);

  let onReanimatedStateChange;
  let onReanimatedUpdateEvent;
  let onReanimatedTouchEvent;

  if (!config.disableReanimated) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    onReanimatedStateChange = useReanimatedStateChangeEvent(handlerTag, config);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    onReanimatedUpdateEvent = useReanimatedUpdateEvent(handlerTag, config);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    onReanimatedTouchEvent = useReanimatedTouchEvent(handlerTag, config);
  }

  let onGestureHandlerAnimatedEvent: AnimatedEvent | undefined;
  if (isAnimatedEvent(config.onUpdate)) {
    checkMappingForChangeProperties(config.onUpdate);
    // TODO: Remove cast when config is properly typed.
    onGestureHandlerAnimatedEvent = config.onUpdate as AnimatedEvent;
  }

  return {
    onGestureHandlerStateChange,
    onGestureHandlerEvent,
    onGestureHandlerTouchEvent,
    onReanimatedStateChange,
    onReanimatedUpdateEvent,
    onReanimatedTouchEvent,
    onGestureHandlerAnimatedEvent,
  };
}
