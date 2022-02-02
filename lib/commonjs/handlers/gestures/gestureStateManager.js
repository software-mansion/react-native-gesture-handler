"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.GestureStateManager = void 0;

var _reanimatedWrapper = require("./reanimatedWrapper");

var _State = require("../../State");

const GestureStateManager = {
  create(handlerTag) {
    'worklet';

    return {
      begin: () => {
        'worklet';

        if (_reanimatedWrapper.Reanimated) {
          _reanimatedWrapper.Reanimated.setGestureState(handlerTag, _State.State.BEGAN);
        } else {
          console.warn('react-native-reanimated is required in order to use synchronous state management');
        }
      },
      activate: () => {
        'worklet';

        if (_reanimatedWrapper.Reanimated) {
          _reanimatedWrapper.Reanimated.setGestureState(handlerTag, _State.State.ACTIVE);
        } else {
          console.warn('react-native-reanimated is required in order to use synchronous state management');
        }
      },
      fail: () => {
        'worklet';

        if (_reanimatedWrapper.Reanimated) {
          _reanimatedWrapper.Reanimated.setGestureState(handlerTag, _State.State.FAILED);
        } else {
          console.warn('react-native-reanimated is required in order to use synchronous state management');
        }
      },
      end: () => {
        'worklet';

        if (_reanimatedWrapper.Reanimated) {
          _reanimatedWrapper.Reanimated.setGestureState(handlerTag, _State.State.END);
        } else {
          console.warn('react-native-reanimated is required in order to use synchronous state management');
        }
      }
    };
  }

};
exports.GestureStateManager = GestureStateManager;
//# sourceMappingURL=gestureStateManager.js.map