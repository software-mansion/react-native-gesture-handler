import { GestureTouchEvent } from '../../../handlers/gestureHandlerCommon';
import { runWorklet, touchEventTypeToCallbackType } from '../utils';
import { Reanimated } from '../../../handlers/gestures/reanimatedWrapper';
import { TouchEventType } from '../../../TouchEventType';
import { EventWithNativeEvent, TouchEvent } from '../../interfaces';

export function useTouchEvent(config: any, shouldUseReanimated: boolean) {
  const onGestureHandlerTouchEvent = (event: TouchEvent) => {
    'worklet';

    if (
      // @ts-ignore That's the point, we want to check if nativeEvent exists or not
      event.nativeEvent &&
      (event as EventWithNativeEvent<GestureTouchEvent>).nativeEvent
        .eventType !== TouchEventType.UNDETERMINED
    ) {
      runWorklet(
        touchEventTypeToCallbackType(
          (event as EventWithNativeEvent<GestureTouchEvent>).nativeEvent
            .eventType
        ),
        config,
        event
      );
    } else if (
      (event as GestureTouchEvent).eventType !== TouchEventType.UNDETERMINED
    ) {
      runWorklet(
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
