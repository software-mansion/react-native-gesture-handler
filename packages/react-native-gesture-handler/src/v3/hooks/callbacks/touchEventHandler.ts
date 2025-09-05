import { NativeSyntheticEvent } from 'react-native';
import { CallbackHandlers, TouchEvent } from '../../types';
import { isEventForHandlerWithTag, isNativeEvent } from '../utils';
import { TouchEventType } from '../../../TouchEventType';
import { GestureTouchEvent } from '../../../handlers/gestureHandlerCommon';
import {
  runCallback,
  touchEventTypeToCallbackType,
} from '../utils/eventHandlersUtils';

export function getTouchEventHandler(
  handlerTag: number,
  callbacks: CallbackHandlers
) {
  return (event: TouchEvent) => {
    'worklet';

    if (!isEventForHandlerWithTag(handlerTag, event)) {
      return;
    }

    if (
      isNativeEvent(event) &&
      event.nativeEvent.eventType !== TouchEventType.UNDETERMINED
    ) {
      runCallback(
        touchEventTypeToCallbackType(
          (event as NativeSyntheticEvent<GestureTouchEvent>).nativeEvent
            .eventType
        ),
        callbacks,
        event
      );
    } else if (
      (event as GestureTouchEvent).eventType !== TouchEventType.UNDETERMINED
    ) {
      runCallback(
        touchEventTypeToCallbackType((event as GestureTouchEvent).eventType),
        callbacks,
        event
      );
    }
  };
}
