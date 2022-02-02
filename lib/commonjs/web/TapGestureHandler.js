"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _hammerjs = _interopRequireDefault(require("@egjs/hammerjs"));

var _DiscreteGestureHandler = _interopRequireDefault(require("./DiscreteGestureHandler"));

var _utils = require("./utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class TapGestureHandler extends _DiscreteGestureHandler.default {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "_shouldFireEndEvent", null);

    _defineProperty(this, "_timer", void 0);

    _defineProperty(this, "_multiTapTimer", void 0);

    _defineProperty(this, "onSuccessfulTap", ev => {
      if (this._getPendingGestures().length) {
        this._shouldFireEndEvent = ev;
        return;
      }

      if (ev.eventType === _hammerjs.default.INPUT_END) {
        this.sendEvent({ ...ev,
          eventType: _hammerjs.default.INPUT_MOVE
        });
      } // When handler gets activated it will turn into State.END immediately.


      this.sendEvent({ ...ev,
        isFinal: true
      });
      this.onGestureEnded(ev);
    });
  }

  // TODO unused?
  get name() {
    return 'tap';
  }

  get NativeGestureClass() {
    return _hammerjs.default.Tap;
  }

  get maxDelayMs() {
    // @ts-ignore TODO(TS) trace down config
    return (0, _utils.isnan)(this.config.maxDelayMs) ? 300 : this.config.maxDelayMs;
  }

  simulateCancelEvent(inputData) {
    if (this.isGestureRunning) {
      this.cancelEvent(inputData);
    }
  }

  onGestureActivated(ev) {
    if (this.isGestureRunning) {
      this.onSuccessfulTap(ev);
    }
  }

  onRawEvent(ev) {
    super.onRawEvent(ev); // Attempt to create a touch-down event by checking if a valid tap hasn't started yet, then validating the input.

    if (!this.hasGestureFailed && !this.isGestureRunning && // Prevent multi-pointer events from misfiring.
    !ev.isFinal) {
      // Tap Gesture start event
      const gesture = this.hammer.get(this.name); // @ts-ignore TODO(TS) trace down config

      if (gesture.options.enable(gesture, ev)) {
        clearTimeout(this._multiTapTimer);
        this.onStart(ev);
        this.sendEvent(ev);
      }
    }

    if (ev.isFinal && ev.maxPointers > 1) {
      setTimeout(() => {
        // Handle case where one finger presses slightly
        // after the first finger on a multi-tap event
        if (this.isGestureRunning) {
          this.cancelEvent(ev);
        }
      });
    }

    if (this.hasGestureFailed) {
      return;
    } // Hammer doesn't send a `cancel` event for taps.
    // Manually fail the event.


    if (ev.isFinal) {
      // Handle case where one finger presses slightly
      // after the first finger on a multi-tap event
      if (ev.maxPointers > 1) {
        setTimeout(() => {
          if (this.isGestureRunning) {
            this.cancelEvent(ev);
          }
        });
      } // Clear last timer


      clearTimeout(this._timer); // Create time out for multi-taps.

      this._timer = setTimeout(() => {
        this.hasGestureFailed = true;
        this.cancelEvent(ev);
      }, this.maxDelayMs);
    } else if (!this.hasGestureFailed && !this.isGestureRunning) {
      // Tap Gesture start event
      const gesture = this.hammer.get(this.name); // @ts-ignore TODO(TS) trace down config

      if (gesture.options.enable(gesture, ev)) {
        clearTimeout(this._multiTapTimer);
        this.onStart(ev);
        this.sendEvent(ev);
      }
    }
  }

  getHammerConfig() {
    return { ...super.getHammerConfig(),
      event: this.name,
      // @ts-ignore TODO(TS) trace down config
      taps: (0, _utils.isnan)(this.config.numberOfTaps) ? 1 : this.config.numberOfTaps,
      interval: this.maxDelayMs,
      time: // @ts-ignore TODO(TS) trace down config
      (0, _utils.isnan)(this.config.maxDurationMs) || this.config.maxDurationMs == null ? 250 : // @ts-ignore TODO(TS) trace down config
      this.config.maxDurationMs
    };
  }

  updateGestureConfig({
    shouldCancelWhenOutside = true,
    maxDeltaX = Number.NaN,
    maxDeltaY = Number.NaN,
    numberOfTaps = 1,
    minDurationMs = 525,
    maxDelayMs = Number.NaN,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- TODO possibly forgotten to use in updateGestureConfig?
    maxDurationMs = Number.NaN,
    maxDist = 2,
    minPointers = 1,
    maxPointers = 1,
    ...props
  }) {
    return super.updateGestureConfig({
      shouldCancelWhenOutside,
      numberOfTaps,
      maxDeltaX,
      maxDeltaY,
      minDurationMs,
      maxDelayMs,
      maxDist,
      minPointers,
      maxPointers,
      ...props
    });
  }

  onGestureEnded(...props) {
    clearTimeout(this._timer); // @ts-ignore TODO(TS) check how onGestureEnded works

    super.onGestureEnded(...props);
  }

  onWaitingEnded(_gesture) {
    if (this._shouldFireEndEvent) {
      this.onSuccessfulTap(this._shouldFireEndEvent);
      this._shouldFireEndEvent = null;
    }
  }

}

var _default = TapGestureHandler;
exports.default = _default;
//# sourceMappingURL=TapGestureHandler.js.map