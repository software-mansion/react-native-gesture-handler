import { Reanimated } from '../../handlers/gestures/reanimatedWrapper';
import { tagMessage } from '../../utils';
import type {
  AnimatedEvent,
  BaseGestureConfig,
  GestureUpdateEventWithHandlerData,
} from '../types';
import { useGestureEventHandler } from './callbacks/useGestureEventHandler';
import { useReanimatedEventHandler } from './callbacks/useReanimatedEventHandler';
import {
  checkMappingForChangeProperties,
  isNativeAnimatedEvent,
  useMemoizedGestureCallbacks,
} from './utils';

const EMPTY_UI_CALLBACKS = {};

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

export function useGestureCallbacks<
  TConfig,
  THandlerData,
  TExtendedHandlerData extends THandlerData,
>(
  handlerTag: number,
  config: BaseGestureConfig<TConfig, THandlerData, TExtendedHandlerData>
) {
  const callbacks = useMemoizedGestureCallbacks(config);

  const jsEventHandler = useGestureEventHandler(handlerTag, callbacks, config);

  let reanimatedEventHandler;

  if (!config.disableReanimated) {
    // Passing callbacks to UI runtime when `runOnJS` is true would freeze
    // the closure, so we pass an empty object instead.
    //
    // This check is true only when `runOnJS` is a constant or a React state.
    // When `runOnJS` is a SharedValue, we pass original callbacks.
    const uiCallbacks =
      config.runOnJS === true
        ? (EMPTY_UI_CALLBACKS as typeof callbacks)
        : callbacks;

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const reanimatedHandler = Reanimated?.useHandler(uiCallbacks);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    reanimatedEventHandler = useReanimatedEventHandler(
      handlerTag,
      uiCallbacks,
      reanimatedHandler,
      config.changeEventCalculator,
      config.fillInDefaultValues
    );
  }

  let animatedEventHandler:
    | ((event: GestureUpdateEventWithHandlerData<TExtendedHandlerData>) => void)
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
