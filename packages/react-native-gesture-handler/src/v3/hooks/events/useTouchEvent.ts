import { GestureTouchEvent } from '../../../handlers/gestureHandlerCommon';
import {
  isEventForHandlerWithTag,
  isNativeEvent,
  runWorkletCallback,
  touchEventTypeToCallbackType,
} from '../utils';
import { Reanimated } from '../../../handlers/gestures/reanimatedWrapper';
import { TouchEventType } from '../../../TouchEventType';
import { CallbackHandlers, TouchEvent } from '../../types';
import { NativeSyntheticEvent } from 'react-native';

export function useTouchEvent(
  handlerTag: number,
  config: any,
  shouldUseReanimated: boolean
) {
  const handlers: CallbackHandlers = {
    onTouchesDown: config.onTouchesDown,
    onTouchesMove: config.onTouchesMove,
    onTouchesUp: config.onTouchesUp,
    onTouchesCancelled: config.onTouchesCancelled,
  };

  const onGestureHandlerTouchEvent = (event: TouchEvent) => {
    'worklet';

    if (!isEventForHandlerWithTag(handlerTag, event)) {
      return;
    }

    if (
      isNativeEvent(event) &&
      event.nativeEvent.eventType !== TouchEventType.UNDETERMINED
    ) {
      runWorkletCallback(
        touchEventTypeToCallbackType(
          (event as NativeSyntheticEvent<GestureTouchEvent>).nativeEvent
            .eventType
        ),
        handlers,
        event
      );
    } else if (
      (event as GestureTouchEvent).eventType !== TouchEventType.UNDETERMINED
    ) {
      runWorkletCallback(
        touchEventTypeToCallbackType((event as GestureTouchEvent).eventType),
        handlers,
        event
      );
    }
  };

  if (config.disableReanimated) {
    return onGestureHandlerTouchEvent;
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const reanimatedHandler = Reanimated?.useHandler(handlers);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const reanimatedEvent = Reanimated?.useEvent(
    onGestureHandlerTouchEvent,
    ['onGestureHandlerTouchEvent'],
    !!reanimatedHandler?.doDependenciesDiffer
  );

  return shouldUseReanimated ? reanimatedEvent : onGestureHandlerTouchEvent;
}
