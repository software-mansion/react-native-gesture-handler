import { GestureCallbacks, TouchEvent } from '../../types';
import { isEventForHandlerWithTag, maybeExtractNativeEvent } from '../utils';
import { TouchEventType } from '../../../TouchEventType';
import { GestureTouchEvent } from '../../../handlers/gestureHandlerCommon';
import {
  runCallback,
  touchEventTypeToCallbackType,
} from '../utils/eventHandlersUtils';

export function getTouchEventHandler<THandlerData>(
  handlerTag: number,
  callbacks: GestureCallbacks<THandlerData>
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
