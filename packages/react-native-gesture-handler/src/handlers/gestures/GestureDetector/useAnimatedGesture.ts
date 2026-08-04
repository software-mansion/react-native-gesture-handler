import { CallbackType } from '../../../CallbackType';
import { State } from '../../../State';
import { TouchEventType } from '../../../TouchEventType';
import { tagMessage } from '../../../utils';
import type {
  GestureStateChangeEvent,
  GestureTouchEvent,
  GestureUpdateEvent,
} from '../../gestureHandlerCommon';
import type { HandlerCallbacks } from '../gesture';
import type { GestureStateManagerType } from '../gestureStateManager';
import { GestureStateManager } from '../gestureStateManager';
import { Reanimated } from '../reanimatedWrapper';
import type { AttachedGestureState } from './types';

function getHandler(
  type: CallbackType,
  gesture: HandlerCallbacks<Record<string, unknown>>
) {
  'worklet';
  switch (type) {
    case CallbackType.BEGAN:
      return gesture.onBegin;
    case CallbackType.START:
      return gesture.onStart;
    case CallbackType.UPDATE:
      return gesture.onUpdate;
    case CallbackType.CHANGE:
      return gesture.onChange;
    case CallbackType.END:
      return gesture.onEnd;
    case CallbackType.FINALIZE:
      return gesture.onFinalize;
    case CallbackType.TOUCHES_DOWN:
      return gesture.onTouchesDown;
    case CallbackType.TOUCHES_MOVE:
      return gesture.onTouchesMove;
    case CallbackType.TOUCHES_UP:
      return gesture.onTouchesUp;
    case CallbackType.TOUCHES_CANCEL:
      return gesture.onTouchesCancelled;
  }
}

function touchEventTypeToCallbackType(eventType: TouchEventType): CallbackType {
  'worklet';
  switch (eventType) {
    case TouchEventType.TOUCHES_DOWN:
      return CallbackType.TOUCHES_DOWN;
    case TouchEventType.TOUCHES_MOVE:
      return CallbackType.TOUCHES_MOVE;
    case TouchEventType.TOUCHES_UP:
      return CallbackType.TOUCHES_UP;
    case TouchEventType.TOUCHES_CANCEL:
      return CallbackType.TOUCHES_CANCEL;
  }
  return CallbackType.UNDEFINED;
}

function runWorklet(
  type: CallbackType,
  gesture: HandlerCallbacks<Record<string, unknown>>,
  event: GestureStateChangeEvent | GestureUpdateEvent | GestureTouchEvent,
  ...args: unknown[]
) {
  'worklet';
  const handler = getHandler(type, gesture);
  if (gesture.isWorklet[type]) {
    // @ts-ignore Logic below makes sure the correct event is send to the
    // correct handler.
    handler?.(event, ...args);
  } else if (handler) {
    console.warn(tagMessage('Animated gesture callback must be a worklet'));
  }
}

function isStateChangeEvent(
  event: GestureUpdateEvent | GestureStateChangeEvent | GestureTouchEvent
): event is GestureStateChangeEvent {
  'worklet';
  // @ts-ignore Yes, the oldState prop is missing on GestureTouchEvent, that's the point
  return event.oldState != null;
}

function isTouchEvent(
  event: GestureUpdateEvent | GestureStateChangeEvent | GestureTouchEvent
): event is GestureTouchEvent {
  'worklet';
  return event.eventType != null;
}

export function useAnimatedGesture(
  preparedGesture: AttachedGestureState,
  needsRebuild: boolean
) {
  if (!Reanimated) {
    return;
  }

  // Hooks are called conditionally, but the condition is whether the
  // react-native-reanimated is installed, which shouldn't change while running
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const sharedHandlersCallbacks = Reanimated.useSharedValue<
    HandlerCallbacks<Record<string, unknown>>[] | null
  >(null);

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const lastUpdateEvent = Reanimated.useSharedValue<
    (GestureUpdateEvent | undefined)[]
  >([]);

  // not every gesture needs a state controller, init them lazily
  const stateControllers: GestureStateManagerType[] = [];

  const callback = (
    event: GestureStateChangeEvent | GestureUpdateEvent | GestureTouchEvent
  ) => {
    'worklet';

    const currentCallback = sharedHandlersCallbacks.value;
    if (!currentCallback) {
      return;
    }

    for (let i = 0; i < currentCallback.length; i++) {
      const gesture = currentCallback[i];

      if (event.handlerTag !== gesture.handlerTag) {
        continue;
      }

      if (isStateChangeEvent(event)) {
        if (
          event.oldState === State.UNDETERMINED &&
          event.state === State.BEGAN
        ) {
          runWorklet(CallbackType.BEGAN, gesture, event);
        } else if (
          (event.oldState === State.BEGAN ||
            event.oldState === State.UNDETERMINED) &&
          event.state === State.ACTIVE
        ) {
          runWorklet(CallbackType.START, gesture, event);
          lastUpdateEvent.value[gesture.handlerTag] = undefined;
        } else if (
          event.oldState !== event.state &&
          event.state === State.END
        ) {
          if (event.oldState === State.ACTIVE) {
            runWorklet(CallbackType.END, gesture, event, true);
          }
          runWorklet(CallbackType.FINALIZE, gesture, event, true);
        } else if (
          (event.state === State.FAILED || event.state === State.CANCELLED) &&
          event.state !== event.oldState
        ) {
          if (event.oldState === State.ACTIVE) {
            runWorklet(CallbackType.END, gesture, event, false);
          }
          runWorklet(CallbackType.FINALIZE, gesture, event, false);
        }
      } else if (isTouchEvent(event)) {
        if (
          !stateControllers[i] ||
          stateControllers[i].handlerTag !== event.handlerTag
        ) {
          stateControllers[i] = GestureStateManager.create(event.handlerTag);
        }

        if (event.eventType !== TouchEventType.UNDETERMINED) {
          runWorklet(
            touchEventTypeToCallbackType(event.eventType),
            gesture,
            event,
            stateControllers[i]
          );
        }
      } else {
        runWorklet(CallbackType.UPDATE, gesture, event);

        if (gesture.onChange && gesture.changeEventCalculator) {
          runWorklet(
            CallbackType.CHANGE,
            gesture,
            gesture.changeEventCalculator?.(
              event,
              lastUpdateEvent.value[gesture.handlerTag]
            )
          );

          lastUpdateEvent.value[gesture.handlerTag] = event;
        }
      }
    }
  };

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const event = Reanimated.useEvent(
    callback,
    ['onGestureHandlerStateChange', 'onGestureHandlerEvent'],
    needsRebuild
  );

  preparedGesture.animatedEventHandler = event;
  preparedGesture.animatedHandlers = sharedHandlersCallbacks;
}
