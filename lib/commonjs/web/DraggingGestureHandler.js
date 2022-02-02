"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _GestureHandler = _interopRequireDefault(require("./GestureHandler"));

var _reactNative = require("react-native");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable eslint-comments/no-unlimited-disable */

/* eslint-disable */
class DraggingGestureHandler extends _GestureHandler.default {
  get shouldEnableGestureOnSetup() {
    return true;
  }

  transformNativeEvent({
    deltaX,
    deltaY,
    velocityX,
    velocityY,
    center: {
      x,
      y
    }
  }) {
    // @ts-ignore FIXME(TS)
    const rect = this.view.getBoundingClientRect();

    const ratio = _reactNative.PixelRatio.get();

    return {
      translationX: deltaX - (this.__initialX || 0),
      translationY: deltaY - (this.__initialY || 0),
      absoluteX: x,
      absoluteY: y,
      velocityX: velocityX * ratio,
      velocityY: velocityY * ratio,
      x: x - rect.left,
      y: y - rect.top
    };
  }

}

var _default = DraggingGestureHandler;
exports.default = _default;
//# sourceMappingURL=DraggingGestureHandler.js.map