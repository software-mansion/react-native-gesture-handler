"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _hammerjs = _interopRequireDefault(require("@egjs/hammerjs"));

var _State = require("../State");

var _constants = require("./constants");

var _DiscreteGestureHandler = _interopRequireDefault(require("./DiscreteGestureHandler"));

var _utils = require("./utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

class PressGestureHandler extends _DiscreteGestureHandler.default {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "visualFeedbackTimer", void 0);

    _defineProperty(this, "initialEvent", null);

    _defineProperty(this, "shouldDelayTouches", true);
  }

  get name() {
    return 'press';
  }

  get minDurationMs() {
    // @ts-ignore FIXME(TS)
    return (0, _utils.isnan)(this.config.minDurationMs) ? 5 : this.config.minDurationMs;
  }

  get maxDist() {
    return (0, _utils.isnan)(this.config.maxDist) ? 9 : this.config.maxDist;
  }

  get NativeGestureClass() {
    return _hammerjs.default.Press;
  }

  simulateCancelEvent(inputData) {
    // Long press never starts so we can't rely on the running event boolean.
    this.hasGestureFailed = true;
    this.cancelEvent(inputData);
  }

  updateHasCustomActivationCriteria({
    shouldCancelWhenOutside,
    maxDistSq
  }) {
    return shouldCancelWhenOutside || !(0, _utils.isValidNumber)(maxDistSq);
  }

  getState(type) {
    return {
      [_hammerjs.default.INPUT_START]: _State.State.BEGAN,
      [_hammerjs.default.INPUT_MOVE]: _State.State.ACTIVE,
      [_hammerjs.default.INPUT_END]: _State.State.END,
      [_hammerjs.default.INPUT_CANCEL]: _State.State.CANCELLED
    }[type];
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

  onGestureActivated(ev) {
    this.onGestureStart(ev);
  }

  shouldDelayTouchForEvent({
    pointerType
  }) {
    // Don't disable event for mouse input
    return this.shouldDelayTouches && pointerType === 'touch';
  }

  onGestureStart(ev) {
    this.isGestureRunning = true;
    clearTimeout(this.visualFeedbackTimer);
    this.initialEvent = ev;
    this.visualFeedbackTimer = (0, _utils.fireAfterInterval)(() => {
      this.sendGestureStartedEvent(this.initialEvent);
      this.initialEvent = null;
    }, this.shouldDelayTouchForEvent(ev) && _constants.CONTENT_TOUCHES_DELAY);
  }

  sendGestureStartedEvent(ev) {
    clearTimeout(this.visualFeedbackTimer);
    this.visualFeedbackTimer = null;
    this.sendEvent({ ...ev,
      eventType: _hammerjs.default.INPUT_MOVE,
      isFirst: true
    });
  }

  forceInvalidate(event) {
    super.forceInvalidate(event);
    clearTimeout(this.visualFeedbackTimer);
    this.visualFeedbackTimer = null;
    this.initialEvent = null;
  }

  onRawEvent(ev) {
    super.onRawEvent(ev);

    if (this.isGestureRunning) {
      if (ev.isFinal) {
        let timeout;

        if (this.visualFeedbackTimer) {
          // Aesthetic timing for a quick tap.
          // We haven't activated the tap right away to emulate iOS `delaysContentTouches`
          // Now we must send the initial activation event and wait a set amount of time before firing the end event.
          timeout = _constants.CONTENT_TOUCHES_QUICK_TAP_END_DELAY;
          this.sendGestureStartedEvent(this.initialEvent);
          this.initialEvent = null;
        }

        (0, _utils.fireAfterInterval)(() => {
          this.sendEvent({ ...ev,
            eventType: _hammerjs.default.INPUT_END,
            isFinal: true
          }); // @ts-ignore -- this should explicitly support undefined

          this.onGestureEnded();
        }, timeout);
      } else {
        this.sendEvent({ ...ev,
          eventType: _hammerjs.default.INPUT_MOVE,
          isFinal: false
        });
      }
    }
  }

  updateGestureConfig({
    shouldActivateOnStart = false,
    disallowInterruption = false,
    shouldCancelWhenOutside = true,
    minDurationMs = Number.NaN,
    maxDist = Number.NaN,
    minPointers = 1,
    maxPointers = 1,
    ...props
  }) {
    return super.updateGestureConfig({
      shouldActivateOnStart,
      disallowInterruption,
      shouldCancelWhenOutside,
      minDurationMs,
      maxDist,
      minPointers,
      maxPointers,
      ...props
    });
  }

}

var _default = PressGestureHandler;
exports.default = _default;
//# sourceMappingURL=PressGestureHandler.js.map