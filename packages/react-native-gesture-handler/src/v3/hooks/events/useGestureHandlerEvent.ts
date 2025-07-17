import { CALLBACK_TYPE } from '../../../handlers/gestures/gesture';
import { compareTags, runWorklet } from '../utils';
import { Reanimated } from '../../../handlers/gestures/reanimatedWrapper';
import { UpdateEvent } from '../../interfaces';

export function useGestureHandlerEvent(
  handlerTag: number,
  config: any,
  shouldUseReanimated: boolean
) {
  const lastUpdateEvents = shouldUseReanimated
    ? Reanimated!.useSharedValue<(UpdateEvent | undefined)[]>([])
    : ([] as UpdateEvent[]);

  const onGestureHandlerEvent = (event: UpdateEvent) => {
    'worklet';

    if (!compareTags(handlerTag, event)) {
      return;
    }

    runWorklet(CALLBACK_TYPE.UPDATE, config, event);

    if (config.onChange && config.changeEventCalculator) {
      const lastUpdateEvent = Reanimated?.isSharedValue(lastUpdateEvents)
        ? lastUpdateEvents.value[handlerTag]
        : lastUpdateEvents[handlerTag];

      runWorklet(
        CALLBACK_TYPE.CHANGE,
        config,
        config.changeEventCalculator?.(event, lastUpdateEvent)
      );

      if (Reanimated?.isSharedValue(lastUpdateEvents)) {
        lastUpdateEvents.value[handlerTag] = event;
      } else {
        lastUpdateEvents[handlerTag] = event;
      }
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
