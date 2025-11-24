import { useGestureStateChangeEvent } from './callbacks/js/useGestureStateChangeEvent';
import { useGestureUpdateEvent } from './callbacks/js/useGestureUpdateEvent';
import { useGestureTouchEvent } from './callbacks/js/useGestureTouchEvent';
import { AnimatedEvent, BaseGestureConfig, GestureUpdateEvent } from '../types';
import {
  checkMappingForChangeProperties,
  isNativeAnimatedEvent,
} from './utils';
import { useReanimatedStateChangeEvent } from './callbacks/reanimated/useReanimatedStateChangeEvent';
import { useReanimatedUpdateEvent } from './callbacks/reanimated/useReanimatedUpdateEvent';
import { useReanimatedTouchEvent } from './callbacks/reanimated/useReanimatedTouchEvent';
import { tagMessage } from '../../utils';

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
  const onGestureHandlerStateChange = useGestureStateChangeEvent(
    handlerTag,
    config
  );
  const onGestureHandlerEvent = useGestureUpdateEvent(handlerTag, config);
  const onGestureHandlerTouchEvent = useGestureTouchEvent(handlerTag, config);

  let onReanimatedStateChange;
  let onReanimatedUpdateEvent;
  let onReanimatedTouchEvent;

  if (!config.disableReanimated) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    onReanimatedStateChange = useReanimatedStateChangeEvent(handlerTag, config);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    onReanimatedUpdateEvent = useReanimatedUpdateEvent(handlerTag, config);
    // eslint-disable-next-line react-hooks/rules-of-hooks
    onReanimatedTouchEvent = useReanimatedTouchEvent(handlerTag, config);
  }

  let onGestureHandlerAnimatedEvent:
    | ((event: GestureUpdateEvent<THandlerData>) => void)
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
      onGestureHandlerAnimatedEvent = config.onUpdate;
    }
  }

  return {
    onGestureHandlerStateChange,
    onGestureHandlerEvent,
    onGestureHandlerTouchEvent,
    onReanimatedStateChange,
    onReanimatedUpdateEvent,
    onReanimatedTouchEvent,
    onGestureHandlerAnimatedEvent,
  };
}
