import { useGestureStateChangeEvent } from './callbacks/js/useGestureStateChangeEvent';
import { useGestureUpdateEvent } from './callbacks/js/useGestureUpdateEvent';
import { useGestureTouchEvent } from './callbacks/js/useGestureTouchEvent';
import {
  AnimatedEvent,
  BaseGestureConfig,
  GestureUpdateEventWithHandlerData,
} from '../types';
import {
  checkMappingForChangeProperties,
  isNativeAnimatedEvent,
  prepareStateChangeHandlers,
  prepareTouchHandlers,
  prepareUpdateHandlers,
} from './utils';
import { useReanimatedEventHandler } from './callbacks/useReanimatedEventHandler';
import { tagMessage } from '../../utils';
import {
  Reanimated,
  ReanimatedContext,
} from '../../handlers/gestures/reanimatedWrapper';
import { useMemo } from 'react';

function guardJSAnimatedEvent(handler: (...args: unknown[]) => void) {
  return (...args: unknown[]) => {
    console.log('Warning: Animated.event called in JS mode.');
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
  const jsContext: ReanimatedContext<THandlerData> = useMemo(() => {
    return {
      lastUpdateEvent: undefined,
    };
  }, []);

  const onGestureHandlerStateChange = useGestureStateChangeEvent(
    handlerTag,
    config,
    jsContext
  );
  const onGestureHandlerEvent = useGestureUpdateEvent(
    handlerTag,
    config,
    jsContext
  );
  const onGestureHandlerTouchEvent = useGestureTouchEvent(handlerTag, config);

  let onReanimatedEvent;

  if (!config.disableReanimated) {
    const handlers = {
      ...prepareStateChangeHandlers(config),
      ...prepareUpdateHandlers(config).handlers,
      ...prepareTouchHandlers(config),
    };
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const reanimatedHandler = Reanimated?.useHandler(handlers);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    onReanimatedEvent = useReanimatedEventHandler(
      handlerTag,
      handlers,
      reanimatedHandler,
      config.changeEventCalculator
    );
  }

  let onGestureHandlerAnimatedEvent:
    | ((event: GestureUpdateEventWithHandlerData<THandlerData>) => void)
    | AnimatedEvent
    | undefined;
  if (config.dispatchesAnimatedEvents) {
    if (__DEV__ && isNativeAnimatedEvent(config.onUpdate)) {
      checkMappingForChangeProperties(config.onUpdate);
    }

    if (__DEV__ && !isNativeAnimatedEvent(config.onUpdate)) {
      // @ts-expect-error At this point we know it's not a native animated event, so it's callable
      onGestureHandlerAnimatedEvent = guardJSAnimatedEvent(config.onUpdate);
    } else {
      // @ts-expect-error The structure of an AnimatedEvent differs from other event types
      onGestureHandlerAnimatedEvent = config.onUpdate;
    }
  }

  return {
    onGestureHandlerStateChange,
    onGestureHandlerEvent,
    onGestureHandlerTouchEvent,
    onReanimatedEvent,
    onGestureHandlerAnimatedEvent,
  };
}
