import { CALLBACK_TYPE } from '../../../handlers/gestures/gesture';
import { compareTags, runWorklet } from '../utils';
import { Reanimated } from '../../../handlers/gestures/reanimatedWrapper';
import { UpdateEvent } from '../../interfaces';

function useReanimatedEvent(handlerTag: number, config: any) {
  const lastUpdateEvents = Reanimated!.useSharedValue<
    (UpdateEvent | undefined)[]
  >([]);

  const onGestureHandlerEvent = (event: UpdateEvent) => {
    'worklet';

    if (!compareTags(handlerTag, event)) {
      return;
    }

    runWorklet(CALLBACK_TYPE.UPDATE, config, event);

    if (config.onChange && config.changeEventCalculator) {
      runWorklet(
        CALLBACK_TYPE.CHANGE,
        config,
        config.changeEventCalculator?.(
          event,
          lastUpdateEvents.value[handlerTag]
        )
      );

      lastUpdateEvents.value[handlerTag] = event;
    }
  };

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

function gestureHandlerEvent(handlerTag: number, config: any) {
  const lastUpdateEvents: UpdateEvent[] = [];

  const onGestureHandlerEvent = (event: UpdateEvent) => {
    'worklet';

    if (!compareTags(handlerTag, event)) {
      return;
    }

    runWorklet(CALLBACK_TYPE.UPDATE, config, event);

    if (config.onChange && config.changeEventCalculator) {
      runWorklet(
        CALLBACK_TYPE.CHANGE,
        config,
        config.changeEventCalculator?.(event, lastUpdateEvents[handlerTag])
      );

      lastUpdateEvents[handlerTag] = event;
    }
  };

  return onGestureHandlerEvent;
}

export function useGestureHandlerEvent(
  handlerTag: number,
  config: any,
  shouldUseReanimated: boolean
) {
  return shouldUseReanimated
    ? // eslint-disable-next-line react-hooks/rules-of-hooks
      useReanimatedEvent(handlerTag, config)
    : gestureHandlerEvent(handlerTag, config);
}
