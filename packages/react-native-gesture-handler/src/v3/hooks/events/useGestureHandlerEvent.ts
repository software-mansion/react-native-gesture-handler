import { CALLBACK_TYPE } from '../../../handlers/gestures/gesture';
import {
  GestureStateChangeEvent,
  GestureTouchEvent,
  GestureUpdateEvent,
} from '../../../handlers/gestureHandlerCommon';
import { isStateChangeEvent, isTouchEvent, runWorklet } from '../utils';
import { Reanimated } from '../../../handlers/gestures/reanimatedWrapper';

export function useGestureHandlerEvent(
  config: any,
  shouldUseReanimated: boolean
) {
  const onGestureHandlerEvent = (
    event: GestureUpdateEvent | GestureStateChangeEvent | GestureTouchEvent
  ) => {
    'worklet';
    if (isStateChangeEvent(event) || isTouchEvent(event)) {
      return;
    }

    runWorklet(CALLBACK_TYPE.UPDATE, config, event);

    if (config.onChange && config.changeEventCalculator) {
      runWorklet(
        CALLBACK_TYPE.CHANGE,
        config,
        config.changeEventCalculator?.(
          event
          //   lastUpdateEvent.value[config.handlerTag]
        )
      );

      //   lastUpdateEvent.value[gesture.handlerTag] = event;
    }
  };

  if (shouldUseReanimated) {
    const handlers = {
      onChange: config.onChange,
      onUpdate: config.onUpdate,
    };

    const { doDependenciesDiffer } = Reanimated!.useHandler(handlers);

    return Reanimated!.useEvent(
      onGestureHandlerEvent,
      ['onGestureHandlerEvent'],
      doDependenciesDiffer
    );
  }

  return onGestureHandlerEvent;
}
