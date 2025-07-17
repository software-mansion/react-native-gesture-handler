import { CALLBACK_TYPE } from '../../../handlers/gestures/gesture';
import { runWorklet } from '../utils';
import { Reanimated } from '../../../handlers/gestures/reanimatedWrapper';
import { UpdateEvent } from '../../interfaces';

export function useGestureHandlerEvent(
  config: any,
  shouldUseReanimated: boolean
) {
  const onGestureHandlerEvent = (event: UpdateEvent) => {
    'worklet';

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
