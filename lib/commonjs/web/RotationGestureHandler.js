"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _hammerjs = _interopRequireDefault(require("@egjs/hammerjs"));

var _constants = require("./constants");

var _IndiscreteGestureHandler = _interopRequireDefault(require("./IndiscreteGestureHandler"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class RotationGestureHandler extends _IndiscreteGestureHandler.default {
  get name() {
    return 'rotate';
  }

  get NativeGestureClass() {
    return _hammerjs.default.Rotate;
  }

  transformNativeEvent({
    rotation,
    velocity,
    center
  }) {
    var _this$initialRotation;

    return {
      rotation: (rotation - ((_this$initialRotation = this.initialRotation) !== null && _this$initialRotation !== void 0 ? _this$initialRotation : 0)) * _constants.DEG_RAD,
      anchorX: center.x,
      anchorY: center.y,
      velocity
    };
  }

}

var _default = RotationGestureHandler;
exports.default = _default;
//# sourceMappingURL=RotationGestureHandler.js.map