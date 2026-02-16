import { GestureCallbacks, TouchEvent } from '../../types';
import {
  isEventForHandlerWithTag,
  maybeExtractNativeEvent,
  runCallback,
  touchEventTypeToCallbackType,
} from '../utils';
import { TouchEventType } from '../../../TouchEventType';
import { GestureTouchEvent } from '../../../handlers/gestureHandlerCommon';

export function getTouchEventHandler<TBaseHandlerData, THandlerData>(
  handlerTag: number,
  callbacks: GestureCallbacks<TBaseHandlerData, THandlerData>
) {
  return (sourceEvent: TouchEvent) => {
    'worklet';

    const event = maybeExtractNativeEvent(sourceEvent) as GestureTouchEvent;

    if (!isEventForHandlerWithTag(handlerTag, event)) {
      return;
    }

    if (event.eventType !== TouchEventType.UNDETERMINED) {
      runCallback(
        touchEventTypeToCallbackType(event.eventType),
        callbacks,
        event
      );
    }
  };
}
