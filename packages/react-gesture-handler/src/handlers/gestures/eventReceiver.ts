import { State } from '../../State';
import { TouchEventType } from '../../TouchEventType';
import {
  GestureTouchEvent,
  GestureUpdateEvent,
  GestureStateChangeEvent,
} from '../gestureHandlerCommon';
import { findHandler, findOldGestureHandler } from '../handlersRegistry';
import { BaseGesture } from './gesture';
import {
  GestureStateManager,
  GestureStateManagerType,
} from './gestureStateManager';

const gestureStateManagers: Map<number, GestureStateManagerType> = new Map<
  number,
  GestureStateManagerType
>();

const lastUpdateEvent: (GestureUpdateEvent | undefined)[] = [];

function isStateChangeEvent(
  event: GestureUpdateEvent | GestureStateChangeEvent | GestureTouchEvent
): event is GestureStateChangeEvent {
  // @ts-ignore oldState doesn't exist on GestureTouchEvent and that's the point
  return event.oldState != null;
}

function isTouchEvent(
  event: GestureUpdateEvent | GestureStateChangeEvent | GestureTouchEvent
): event is GestureTouchEvent {
  return event.eventType != null;
}

export function onGestureHandlerEvent(
  event: GestureUpdateEvent | GestureStateChangeEvent | GestureTouchEvent
) {
  const handler = findHandler(event.handlerTag) as BaseGesture<
    Record<string, unknown>
  >;

  if (handler) {
    if (isStateChangeEvent(event)) {
      if (
        event.oldState === State.UNDETERMINED &&
        event.state === State.BEGAN
      ) {
        handler.handlers.onBegin?.(event);
      } else if (
        (event.oldState === State.BEGAN ||
          event.oldState === State.UNDETERMINED) &&
        event.state === State.ACTIVE
      ) {
        handler.handlers.onStart?.(event);
        lastUpdateEvent[handler.handlers.handlerTag] = event;
      } else if (event.oldState !== event.state && event.state === State.END) {
        if (event.oldState === State.ACTIVE) {
          handler.handlers.onEnd?.(event, true);
        }
        handler.handlers.onFinalize?.(event, true);
        lastUpdateEvent[handler.handlers.handlerTag] = undefined;
      } else if (
        (event.state === State.FAILED || event.state === State.CANCELLED) &&
        event.oldState !== event.state
      ) {
        if (event.oldState === State.ACTIVE) {
          handler.handlers.onEnd?.(event, false);
        }
        handler.handlers.onFinalize?.(event, false);
        gestureStateManagers.delete(event.handlerTag);
        lastUpdateEvent[handler.handlers.handlerTag] = undefined;
      }
    } else if (isTouchEvent(event)) {
      if (!gestureStateManagers.has(event.handlerTag)) {
        gestureStateManagers.set(
          event.handlerTag,
          GestureStateManager.create(event.handlerTag)
        );
      }

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const manager = gestureStateManagers.get(event.handlerTag)!;

      switch (event.eventType) {
        case TouchEventType.TOUCHES_DOWN:
          handler.handlers?.onTouchesDown?.(event, manager);
          break;
        case TouchEventType.TOUCHES_MOVE:
          handler.handlers?.onTouchesMove?.(event, manager);
          break;
        case TouchEventType.TOUCHES_UP:
          handler.handlers?.onTouchesUp?.(event, manager);
          break;
        case TouchEventType.TOUCHES_CANCELLED:
          handler.handlers?.onTouchesCancelled?.(event, manager);
          break;
      }
    } else {
      handler.handlers.onUpdate?.(event);

      if (handler.handlers.onChange && handler.handlers.changeEventCalculator) {
        handler.handlers.onChange?.(
          handler.handlers.changeEventCalculator?.(
            event,
            lastUpdateEvent[handler.handlers.handlerTag]
          )
        );

        lastUpdateEvent[handler.handlers.handlerTag] = event;
      }
    }
  } else {
    const oldHandler = findOldGestureHandler(event.handlerTag);
    if (oldHandler) {
      const nativeEvent = { nativeEvent: event };
      if (isStateChangeEvent(event)) {
        oldHandler.onGestureStateChange(nativeEvent);
      } else {
        oldHandler.onGestureEvent(nativeEvent);
      }
      return;
    }
  }
}
