import { DeviceEventEmitter } from 'react-native';
import { State } from '../../State';
import { EventType } from '../../EventType';
import { findHandler } from '../handlersRegistry';
let gestureHandlerEventSubscription = null;
let gestureHandlerStateChangeEventSubscription = null;
const dummyStateManager = {
  begin: () => {
    console.warn('You have to use react-native-reanimated in order to control the state of the gesture.');
  },
  activate: () => {
    console.warn('You have to use react-native-reanimated in order to control the state of the gesture.');
  },
  end: () => {
    console.warn('You have to use react-native-reanimated in order to control the state of the gesture.');
  },
  fail: () => {
    console.warn('You have to use react-native-reanimated in order to control the state of the gesture.');
  }
};
const lastUpdateEvent = [];

function isStateChangeEvent(event) {
  // @ts-ignore oldState doesn't exist on GestureTouchEvent and that's the point
  return event.oldState != null;
}

function isTouchEvent(event) {
  return event.eventType != null;
}

function onGestureHandlerEvent(event) {
  var _handler$handlers7, _handler$handlers7$on, _handler$handlers8, _handler$handlers8$on, _handler$handlers9, _handler$handlers9$on, _handler$handlers10, _handler$handlers10$o;

  const handler = findHandler(event.handlerTag);

  if (handler) {
    if (isStateChangeEvent(event)) {
      if (event.oldState === State.UNDETERMINED && event.state === State.BEGAN) {
        var _handler$handlers$onB, _handler$handlers;

        (_handler$handlers$onB = (_handler$handlers = handler.handlers).onBegin) === null || _handler$handlers$onB === void 0 ? void 0 : _handler$handlers$onB.call(_handler$handlers, event);
      } else if ((event.oldState === State.BEGAN || event.oldState === State.UNDETERMINED) && event.state === State.ACTIVE) {
        var _handler$handlers$onS, _handler$handlers2;

        (_handler$handlers$onS = (_handler$handlers2 = handler.handlers).onStart) === null || _handler$handlers$onS === void 0 ? void 0 : _handler$handlers$onS.call(_handler$handlers2, event);
        lastUpdateEvent[handler.handlers.handlerTag] = event;
      } else if (event.oldState !== event.state && event.state === State.END) {
        var _handler$handlers$onF, _handler$handlers4;

        if (event.oldState === State.ACTIVE) {
          var _handler$handlers$onE, _handler$handlers3;

          (_handler$handlers$onE = (_handler$handlers3 = handler.handlers).onEnd) === null || _handler$handlers$onE === void 0 ? void 0 : _handler$handlers$onE.call(_handler$handlers3, event, true);
        }

        (_handler$handlers$onF = (_handler$handlers4 = handler.handlers).onFinalize) === null || _handler$handlers$onF === void 0 ? void 0 : _handler$handlers$onF.call(_handler$handlers4, event, true);
        lastUpdateEvent[handler.handlers.handlerTag] = undefined;
      } else if ((event.state === State.FAILED || event.state === State.CANCELLED) && event.oldState !== event.state) {
        var _handler$handlers$onF2, _handler$handlers6;

        if (event.oldState === State.ACTIVE) {
          var _handler$handlers$onE2, _handler$handlers5;

          (_handler$handlers$onE2 = (_handler$handlers5 = handler.handlers).onEnd) === null || _handler$handlers$onE2 === void 0 ? void 0 : _handler$handlers$onE2.call(_handler$handlers5, event, false);
        }

        (_handler$handlers$onF2 = (_handler$handlers6 = handler.handlers).onFinalize) === null || _handler$handlers$onF2 === void 0 ? void 0 : _handler$handlers$onF2.call(_handler$handlers6, event, false);
        lastUpdateEvent[handler.handlers.handlerTag] = undefined;
      }
    } else if (isTouchEvent(event)) {
      switch (event.eventType) {
        case EventType.TOUCHES_DOWN:
          (_handler$handlers7 = handler.handlers) === null || _handler$handlers7 === void 0 ? void 0 : (_handler$handlers7$on = _handler$handlers7.onTouchesDown) === null || _handler$handlers7$on === void 0 ? void 0 : _handler$handlers7$on.call(_handler$handlers7, event, dummyStateManager);
          break;

        case EventType.TOUCHES_MOVE:
          (_handler$handlers8 = handler.handlers) === null || _handler$handlers8 === void 0 ? void 0 : (_handler$handlers8$on = _handler$handlers8.onTouchesMove) === null || _handler$handlers8$on === void 0 ? void 0 : _handler$handlers8$on.call(_handler$handlers8, event, dummyStateManager);
          break;

        case EventType.TOUCHES_UP:
          (_handler$handlers9 = handler.handlers) === null || _handler$handlers9 === void 0 ? void 0 : (_handler$handlers9$on = _handler$handlers9.onTouchesUp) === null || _handler$handlers9$on === void 0 ? void 0 : _handler$handlers9$on.call(_handler$handlers9, event, dummyStateManager);
          break;

        case EventType.TOUCHES_CANCELLED:
          (_handler$handlers10 = handler.handlers) === null || _handler$handlers10 === void 0 ? void 0 : (_handler$handlers10$o = _handler$handlers10.onTouchesCancelled) === null || _handler$handlers10$o === void 0 ? void 0 : _handler$handlers10$o.call(_handler$handlers10, event, dummyStateManager);
          break;
      }
    } else {
      var _handler$handlers$onU, _handler$handlers11;

      (_handler$handlers$onU = (_handler$handlers11 = handler.handlers).onUpdate) === null || _handler$handlers$onU === void 0 ? void 0 : _handler$handlers$onU.call(_handler$handlers11, event);

      if (handler.handlers.onChange && handler.handlers.changeEventCalculator) {
        var _handler$handlers$onC, _handler$handlers12, _handler$handlers$cha, _handler$handlers13;

        (_handler$handlers$onC = (_handler$handlers12 = handler.handlers).onChange) === null || _handler$handlers$onC === void 0 ? void 0 : _handler$handlers$onC.call(_handler$handlers12, (_handler$handlers$cha = (_handler$handlers13 = handler.handlers).changeEventCalculator) === null || _handler$handlers$cha === void 0 ? void 0 : _handler$handlers$cha.call(_handler$handlers13, event, lastUpdateEvent[handler.handlers.handlerTag]));
        lastUpdateEvent[handler.handlers.handlerTag] = event;
      }
    }
  }
}

export function startListening() {
  stopListening();
  gestureHandlerEventSubscription = DeviceEventEmitter.addListener('onGestureHandlerEvent', onGestureHandlerEvent);
  gestureHandlerStateChangeEventSubscription = DeviceEventEmitter.addListener('onGestureHandlerStateChange', onGestureHandlerEvent);
}
export function stopListening() {
  if (gestureHandlerEventSubscription) {
    DeviceEventEmitter.removeSubscription(gestureHandlerEventSubscription);
    gestureHandlerEventSubscription = null;
  }

  if (gestureHandlerStateChangeEventSubscription) {
    DeviceEventEmitter.removeSubscription(gestureHandlerStateChangeEventSubscription);
    gestureHandlerStateChangeEventSubscription = null;
  }
}
//# sourceMappingURL=eventReceiver.js.map