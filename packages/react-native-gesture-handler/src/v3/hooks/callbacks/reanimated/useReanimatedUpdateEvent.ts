import { Reanimated } from '../../../../handlers/gestures/reanimatedWrapper';
import { extractUpdateHandlers } from '../../utils/EventHandlersUtils';
import { getUpdateHandler } from '../updateHandler';

export function useReanimatedUpdateEvent(handlerTag: number, config: any) {
  const { handlers, changeEventCalculator } = extractUpdateHandlers(config);

  // We don't want to call hooks conditionally, therefore `useHandler` and `useEvent` will be always called.
  // The only difference is whether we will send events to Reanimated or not.
  // The problem here is that if someone passes `Animated.event` as `onUpdate` prop,
  // it won't be workletized and therefore `useHandler` will throw. In that case we override it to empty `worklet`.
  if (!Reanimated?.isWorkletFunction(handlers.onUpdate)) {
    handlers.onUpdate = () => {
      'worklet';
      // no-op
    };
  }

  const reanimatedHandler = Reanimated?.useHandler(handlers);

  const callback = getUpdateHandler(
    handlerTag,
    handlers,
    reanimatedHandler?.context,
    changeEventCalculator
  );

  const reanimatedEvent = Reanimated?.useEvent(
    callback,
    ['onGestureHandlerReanimatedEvent'],
    !!reanimatedHandler?.doDependenciesDiffer
  );

  return reanimatedEvent;
}
