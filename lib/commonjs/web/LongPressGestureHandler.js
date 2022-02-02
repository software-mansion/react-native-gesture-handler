"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _hammerjs = _interopRequireDefault(require("@egjs/hammerjs"));

var _State = require("../State");

var _PressGestureHandler = _interopRequireDefault(require("./PressGestureHandler"));

var _utils = require("./utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable eslint-comments/no-unlimited-disable */

/* eslint-disable */
class LongPressGestureHandler extends _PressGestureHandler.default {
  get minDurationMs() {
    // @ts-ignore FIXNE(TS)
    return (0, _utils.isnan)(this.config.minDurationMs) ? 251 : this.config.minDurationMs;
  }

  get maxDist() {
    // @ts-ignore FIXNE(TS)
    return (0, _utils.isnan)(this.config.maxDist) ? 9 : this.config.maxDist;
  }

  updateHasCustomActivationCriteria({
    maxDistSq
  }) {
    return !(0, _utils.isValidNumber)(maxDistSq);
  }

  getConfig() {
    if (!this.hasCustomActivationCriteria) {
      // Default config
      // If no params have been defined then this config should emulate the native gesture as closely as possible.
      return {
        shouldCancelWhenOutside: true,
        maxDistSq: 10
      };
    }

    return this.config;
  }

  getHammerConfig() {
    return { ...super.getHammerConfig(),
      // threshold: this.maxDist,
      time: this.minDurationMs
    };
  }

  getState(type) {
    return {
      [_hammerjs.default.INPUT_START]: _State.State.ACTIVE,
      [_hammerjs.default.INPUT_MOVE]: _State.State.ACTIVE,
      [_hammerjs.default.INPUT_END]: _State.State.END,
      [_hammerjs.default.INPUT_CANCEL]: _State.State.FAILED
    }[type];
  }

}

var _default = LongPressGestureHandler;
exports.default = _default;
//# sourceMappingURL=LongPressGestureHandler.js.map