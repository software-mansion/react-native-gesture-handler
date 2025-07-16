import {
  GestureStateChangeEvent,
  GestureTouchEvent,
  GestureUpdateEvent,
} from '../../handlers/gestureHandlerCommon';
import { TouchEventType } from '../../TouchEventType';
import {
  isTouchEvent,
  runWorklet,
  touchEventTypeToCallbackType,
} from './utils';
import { useGestureStateChangeEvent } from './events/useGestureStateChangeEvent';
import { useGestureHandlerEvent } from './events/useGestureHandlerEvent';

export function useGestureEvent(config: any, shouldUseReanimated: boolean) {
  const onGestureHandlerStateChange = useGestureStateChangeEvent(
    config,
    shouldUseReanimated
  );
  const onGestureHandlerEvent = useGestureHandlerEvent(
    config,
    shouldUseReanimated
  );

  const onGestureHandlerTouchEvent = (
    event: GestureUpdateEvent | GestureStateChangeEvent | GestureTouchEvent
  ) => {
    'worklet';

    if (!isTouchEvent(event)) {
      return;
    }

    if (event.eventType !== TouchEventType.UNDETERMINED) {
      runWorklet(touchEventTypeToCallbackType(event.eventType), config, event);
    }
  };

  const onGestureHandlerAnimatedEvent = config.onGestureHandlerAnimatedEvent;

  return {
    onGestureHandlerStateChange,
    onGestureHandlerEvent,
    onGestureHandlerTouchEvent,
    onGestureHandlerAnimatedEvent,
  };
}
