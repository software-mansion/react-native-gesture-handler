"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _GestureHandler = _interopRequireDefault(require("./GestureHandler"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * The base class for **Rotation** and **Pinch** gesture handlers.
 */
class IndiscreteGestureHandler extends _GestureHandler.default {
  get shouldEnableGestureOnSetup() {
    return false;
  }

  updateGestureConfig({
    minPointers = 2,
    maxPointers = 2,
    ...props
  }) {
    return super.updateGestureConfig({
      minPointers,
      maxPointers,
      ...props
    });
  }

  isGestureEnabledForEvent({
    minPointers,
    maxPointers
  }, _recognizer, {
    maxPointers: pointerLength
  }) {
    if (pointerLength > maxPointers) {
      return {
        failed: true
      };
    }

    const validPointerCount = pointerLength >= minPointers;
    return {
      success: validPointerCount
    };
  }

}

var _default = IndiscreteGestureHandler;
exports.default = _default;
//# sourceMappingURL=IndiscreteGestureHandler.js.map