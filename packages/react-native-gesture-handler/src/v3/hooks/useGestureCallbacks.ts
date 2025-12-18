import { useGestureEventHandler } from './callbacks/useGestureEventHandler';
import {
  AnimatedEvent,
  BaseGestureConfig,
  GestureUpdateEventWithHandlerData,
} from '../types';
import {
  checkMappingForChangeProperties,
  isNativeAnimatedEvent,
  useMemoizedGestureCallbacks,
} from './utils';
import { useReanimatedEventHandler } from './callbacks/useReanimatedEventHandler';
import { tagMessage } from '../../utils';
import { Reanimated } from '../../handlers/gestures/reanimatedWrapper';

function guardJSAnimatedEvent(handler: (...args: unknown[]) => void) {
  return (...args: unknown[]) => {
    try {
      handler(...args);
    } catch (e) {
      if (
        e instanceof Error &&
        e.message.includes('Bad event of type undefined for key')
      ) {
        throw new Error(
          tagMessage(
            'The event mapping inside an Animated.event is invalid. ' +
              'Please make sure you are using the correct structure for the gesture event:\n\n' +
              '{ nativeEvent: { handlerData: { /* your mappings here */ } } }'
          )
        );
      }

      throw e;
    }
  };
}

export function useGestureCallbacks<THandlerData, TConfig>(
  handlerTag: number,
  config: BaseGestureConfig<THandlerData, TConfig>
) {
  const callbacks = useMemoizedGestureCallbacks(config);

  const jsEventHandler = useGestureEventHandler(handlerTag, callbacks, config);

  let reanimatedEventHandler;

  if (!config.disableReanimated) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const reanimatedHandler = Reanimated?.useHandler(callbacks);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    reanimatedEventHandler = useReanimatedEventHandler(
      handlerTag,
      callbacks,
      reanimatedHandler,
      config.changeEventCalculator
    );
  }

  let animatedEventHandler:
    | ((event: GestureUpdateEventWithHandlerData<THandlerData>) => void)
    | AnimatedEvent
    | undefined;
  if (config.dispatchesAnimatedEvents) {
    if (__DEV__ && isNativeAnimatedEvent(config.onUpdate)) {
      checkMappingForChangeProperties(config.onUpdate);
    }

    if (__DEV__ && !isNativeAnimatedEvent(config.onUpdate)) {
      // @ts-expect-error At this point we know it's not a native animated event, so it's callable
      animatedEventHandler = guardJSAnimatedEvent(config.onUpdate);
    } else {
      // @ts-expect-error The structure of an AnimatedEvent differs from other event types
      animatedEventHandler = config.onUpdate;
    }
  }

  return {
    jsEventHandler,
    reanimatedEventHandler,
    animatedEventHandler,
  };
}
