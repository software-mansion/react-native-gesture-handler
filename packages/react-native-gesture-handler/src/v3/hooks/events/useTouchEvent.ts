import { GestureTouchEvent } from '../../../handlers/gestureHandlerCommon';
import {
  compareTags,
  runWorkletCallback,
  touchEventTypeToCallbackType,
} from '../utils';
import { Reanimated } from '../../../handlers/gestures/reanimatedWrapper';
import { TouchEventType } from '../../../TouchEventType';
import { TouchEvent } from '../../types';
import { NativeSyntheticEvent } from 'react-native';

export function useTouchEvent(
  handlerTag: number,
  config: any,
  shouldUseReanimated: boolean
) {
  const onGestureHandlerTouchEvent = (event: TouchEvent) => {
    'worklet';

    if (!compareTags(handlerTag, event)) {
      return;
    }

    if (
      // @ts-ignore That's the point, we want to check if nativeEvent exists or not
      event.nativeEvent &&
      (event as NativeSyntheticEvent<GestureTouchEvent>).nativeEvent
        .eventType !== TouchEventType.UNDETERMINED
    ) {
      runWorkletCallback(
        touchEventTypeToCallbackType(
          (event as NativeSyntheticEvent<GestureTouchEvent>).nativeEvent
            .eventType
        ),
        config,
        event
      );
    } else if (
      (event as GestureTouchEvent).eventType !== TouchEventType.UNDETERMINED
    ) {
      runWorkletCallback(
        touchEventTypeToCallbackType((event as GestureTouchEvent).eventType),
        config,
        event
      );
    }
  };

  if (shouldUseReanimated) {
    const handlers = {
      onTouchesDown: config.onTouchesDown,
      onTouchesMove: config.onTouchesMove,
      onTouchesUp: config.onTouchesUp,
      onTouchesCancelled: config.onTouchesCancelled,
    };

    const { doDependenciesDiffer } = Reanimated!.useHandler(handlers);

    return Reanimated!.useEvent(
      onGestureHandlerTouchEvent,
      ['onGestureHandlerTouchEvent'],
      doDependenciesDiffer
    );
  }

  return onGestureHandlerTouchEvent;
}
