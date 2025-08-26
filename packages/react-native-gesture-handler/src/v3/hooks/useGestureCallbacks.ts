import { gestureStateChangeEvent } from './callbacks/js/useGestureStateChangeEvent';
import { gestureUpdateEvent } from './callbacks/js/useGestureUpdateEvent';
import { gestureTouchEvent } from './callbacks/js/useGestureTouchEvent';
import { AnimatedEvent } from '../types';
import { checkMappingForChangeProperties, isAnimatedEvent } from './utils';
import { useReanimatedStateChangeEvent } from './callbacks/reanimated/useReanimatedStateChangeEvent';
import { useReanimatedUpdateEvent } from './callbacks/reanimated/useReanimatedUpdateEvent';
import { useReanimatedTouchEvent } from './callbacks/reanimated/useReanimatedTouchEvent';

export function useGestureCallbacks(handlerTag: number, config: any) {
  const onGestureHandlerStateChange = gestureStateChangeEvent(
    handlerTag,
    config
  );
  const onGestureHandlerEvent = gestureUpdateEvent(handlerTag, config);
  const onGestureHandlerTouchEvent = gestureTouchEvent(handlerTag, config);

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
    onReanimatedStateChange,
    onReanimatedUpdateEvent,
    onReanimatedTouchEvent,
    onGestureHandlerAnimatedEvent,
  };
}
