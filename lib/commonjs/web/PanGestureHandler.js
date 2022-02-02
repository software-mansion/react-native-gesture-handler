"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _hammerjs = _interopRequireDefault(require("@egjs/hammerjs"));

var _constants = require("./constants");

var _DraggingGestureHandler = _interopRequireDefault(require("./DraggingGestureHandler"));

var _utils = require("./utils");

var _State = require("../State");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

class PanGestureHandler extends _DraggingGestureHandler.default {
  get name() {
    return 'pan';
  }

  get NativeGestureClass() {
    return _hammerjs.default.Pan;
  }

  getHammerConfig() {
    return { ...super.getHammerConfig(),
      direction: this.getDirection()
    };
  }

  getState(type) {
    const nextState = super.getState(type); // Ensure that the first state sent is `BEGAN` and not `ACTIVE`

    if (this.previousState === _State.State.UNDETERMINED && nextState === _State.State.ACTIVE) {
      return _State.State.BEGAN;
    }

    return nextState;
  }

  getDirection() {
    const config = this.getConfig();
    const {
      activeOffsetXStart,
      activeOffsetXEnd,
      activeOffsetYStart,
      activeOffsetYEnd,
      minDist
    } = config;
    let directions = [];
    let horizontalDirections = [];

    if (!(0, _utils.isnan)(minDist)) {
      return _hammerjs.default.DIRECTION_ALL;
    }

    if (!(0, _utils.isnan)(activeOffsetXStart)) horizontalDirections.push(_hammerjs.default.DIRECTION_LEFT);
    if (!(0, _utils.isnan)(activeOffsetXEnd)) horizontalDirections.push(_hammerjs.default.DIRECTION_RIGHT);
    if (horizontalDirections.length === 2) horizontalDirections = [_hammerjs.default.DIRECTION_HORIZONTAL];
    directions = directions.concat(horizontalDirections);
    let verticalDirections = [];
    if (!(0, _utils.isnan)(activeOffsetYStart)) verticalDirections.push(_hammerjs.default.DIRECTION_UP);
    if (!(0, _utils.isnan)(activeOffsetYEnd)) verticalDirections.push(_hammerjs.default.DIRECTION_DOWN);
    if (verticalDirections.length === 2) verticalDirections = [_hammerjs.default.DIRECTION_VERTICAL];
    directions = directions.concat(verticalDirections);

    if (!directions.length) {
      return _hammerjs.default.DIRECTION_NONE;
    }

    if (directions[0] === _hammerjs.default.DIRECTION_HORIZONTAL && directions[1] === _hammerjs.default.DIRECTION_VERTICAL) {
      return _hammerjs.default.DIRECTION_ALL;
    }

    if (horizontalDirections.length && verticalDirections.length) {
      return _hammerjs.default.DIRECTION_ALL;
    }

    return directions[0];
  }

  getConfig() {
    if (!this.hasCustomActivationCriteria) {
      // Default config
      // If no params have been defined then this config should emulate the native gesture as closely as possible.
      return {
        minDistSq: 10
      };
    }

    return this.config;
  }

  shouldFailUnderCustomCriteria({
    deltaX,
    deltaY
  }, criteria) {
    return !(0, _utils.isnan)(criteria.failOffsetXStart) && deltaX < criteria.failOffsetXStart || !(0, _utils.isnan)(criteria.failOffsetXEnd) && deltaX > criteria.failOffsetXEnd || !(0, _utils.isnan)(criteria.failOffsetYStart) && deltaY < criteria.failOffsetYStart || !(0, _utils.isnan)(criteria.failOffsetYEnd) && deltaY > criteria.failOffsetYEnd;
  }

  shouldActivateUnderCustomCriteria({
    deltaX,
    deltaY,
    velocity
  }, criteria) {
    return !(0, _utils.isnan)(criteria.activeOffsetXStart) && deltaX < criteria.activeOffsetXStart || !(0, _utils.isnan)(criteria.activeOffsetXEnd) && deltaX > criteria.activeOffsetXEnd || !(0, _utils.isnan)(criteria.activeOffsetYStart) && deltaY < criteria.activeOffsetYStart || !(0, _utils.isnan)(criteria.activeOffsetYEnd) && deltaY > criteria.activeOffsetYEnd || (0, _utils.TEST_MIN_IF_NOT_NAN)((0, _utils.VEC_LEN_SQ)({
      x: deltaX,
      y: deltaY
    }), criteria.minDistSq) || (0, _utils.TEST_MIN_IF_NOT_NAN)(velocity.x, criteria.minVelocityX) || (0, _utils.TEST_MIN_IF_NOT_NAN)(velocity.y, criteria.minVelocityY) || (0, _utils.TEST_MIN_IF_NOT_NAN)((0, _utils.VEC_LEN_SQ)(velocity), criteria.minVelocitySq);
  }

  shouldMultiFingerPanFail({
    pointerLength,
    scale,
    deltaRotation
  }) {
    if (pointerLength <= 1) {
      return false;
    } // Test if the pan had too much pinching or rotating.


    const deltaScale = Math.abs(scale - 1);
    const absDeltaRotation = Math.abs(deltaRotation);

    if (deltaScale > _constants.MULTI_FINGER_PAN_MAX_PINCH_THRESHOLD) {
      // > If the threshold doesn't seem right.
      // You can log the value which it failed at here:
      return true;
    }

    if (absDeltaRotation > _constants.MULTI_FINGER_PAN_MAX_ROTATION_THRESHOLD) {
      // > If the threshold doesn't seem right.
      // You can log the value which it failed at here:
      return true;
    }

    return false;
  }

  updateHasCustomActivationCriteria(criteria) {
    return (0, _utils.isValidNumber)(criteria.minDistSq) || (0, _utils.isValidNumber)(criteria.minVelocityX) || (0, _utils.isValidNumber)(criteria.minVelocityY) || (0, _utils.isValidNumber)(criteria.minVelocitySq) || (0, _utils.isValidNumber)(criteria.activeOffsetXStart) || (0, _utils.isValidNumber)(criteria.activeOffsetXEnd) || (0, _utils.isValidNumber)(criteria.activeOffsetYStart) || (0, _utils.isValidNumber)(criteria.activeOffsetYEnd);
  }

  isGestureEnabledForEvent(props, _recognizer, inputData) {
    if (this.shouldFailUnderCustomCriteria(inputData, props)) {
      return {
        failed: true
      };
    }

    const velocity = {
      x: inputData.velocityX,
      y: inputData.velocityY
    };

    if (this.hasCustomActivationCriteria && this.shouldActivateUnderCustomCriteria({
      deltaX: inputData.deltaX,
      deltaY: inputData.deltaY,
      velocity
    }, props)) {
      if (this.shouldMultiFingerPanFail({
        pointerLength: inputData.maxPointers,
        scale: inputData.scale,
        deltaRotation: inputData.deltaRotation
      })) {
        return {
          failed: true
        };
      }

      return {
        success: true
      };
    }

    return {
      success: false
    };
  }

}

var _default = PanGestureHandler;
exports.default = _default;
//# sourceMappingURL=PanGestureHandler.js.map