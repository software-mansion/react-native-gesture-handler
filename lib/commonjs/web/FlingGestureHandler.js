"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _hammerjs = _interopRequireDefault(require("@egjs/hammerjs"));

var _constants = require("./constants");

var _Errors = require("./Errors");

var _DraggingGestureHandler = _interopRequireDefault(require("./DraggingGestureHandler"));

var _utils = require("./utils");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable eslint-comments/no-unlimited-disable */

/* eslint-disable */
class FlingGestureHandler extends _DraggingGestureHandler.default {
  get name() {
    return 'swipe';
  }

  get NativeGestureClass() {
    return _hammerjs.default.Swipe;
  }

  onGestureActivated(event) {
    this.sendEvent({ ...event,
      eventType: _hammerjs.default.INPUT_MOVE,
      isFinal: false,
      isFirst: true
    });
    this.isGestureRunning = false;
    this.hasGestureFailed = false;
    this.sendEvent({ ...event,
      eventType: _hammerjs.default.INPUT_END,
      isFinal: true
    });
  }

  onRawEvent(ev) {
    super.onRawEvent(ev);

    if (this.hasGestureFailed) {
      return;
    } // Hammer doesn't send a `cancel` event for taps.
    // Manually fail the event.


    if (ev.isFinal) {
      setTimeout(() => {
        if (this.isGestureRunning) {
          this.cancelEvent(ev);
        }
      });
    } else if (!this.hasGestureFailed && !this.isGestureRunning) {
      // Tap Gesture start event
      const gesture = this.hammer.get(this.name); // @ts-ignore FIXME(TS)

      if (gesture.options.enable(gesture, ev)) {
        this.onStart(ev);
        this.sendEvent(ev);
      }
    }
  }

  getHammerConfig() {
    return {
      // @ts-ignore FIXME(TS)
      pointers: this.config.numberOfPointers,
      direction: this.getDirection()
    };
  }

  getTargetDirections(direction) {
    const directions = [];

    if (direction & _constants.Direction.RIGHT) {
      directions.push(_hammerjs.default.DIRECTION_RIGHT);
    }

    if (direction & _constants.Direction.LEFT) {
      directions.push(_hammerjs.default.DIRECTION_LEFT);
    }

    if (direction & _constants.Direction.UP) {
      directions.push(_hammerjs.default.DIRECTION_UP);
    }

    if (direction & _constants.Direction.DOWN) {
      directions.push(_hammerjs.default.DIRECTION_DOWN);
    } // const hammerDirection = directions.reduce((a, b) => a | b, 0);


    return directions;
  }

  getDirection() {
    // @ts-ignore FIXME(TS)
    const {
      direction
    } = this.getConfig();
    let directions = [];

    if (direction & _constants.Direction.RIGHT) {
      directions.push(_hammerjs.default.DIRECTION_HORIZONTAL);
    }

    if (direction & _constants.Direction.LEFT) {
      directions.push(_hammerjs.default.DIRECTION_HORIZONTAL);
    }

    if (direction & _constants.Direction.UP) {
      directions.push(_hammerjs.default.DIRECTION_VERTICAL);
    }

    if (direction & _constants.Direction.DOWN) {
      directions.push(_hammerjs.default.DIRECTION_VERTICAL);
    }

    directions = [...new Set(directions)];
    if (directions.length === 0) return _hammerjs.default.DIRECTION_NONE;
    if (directions.length === 1) return directions[0];
    return _hammerjs.default.DIRECTION_ALL;
  }

  isGestureEnabledForEvent({
    numberOfPointers
  }, _recognizer, {
    maxPointers: pointerLength
  }) {
    const validPointerCount = pointerLength === numberOfPointers;

    if (!validPointerCount && this.isGestureRunning) {
      return {
        failed: true
      };
    }

    return {
      success: validPointerCount
    };
  }

  updateGestureConfig({
    numberOfPointers = 1,
    direction,
    ...props
  }) {
    if ((0, _utils.isnan)(direction) || typeof direction !== 'number') {
      throw new _Errors.GesturePropError('direction', direction, 'number');
    }

    return super.updateGestureConfig({
      numberOfPointers,
      direction,
      ...props
    });
  }

}

var _default = FlingGestureHandler;
exports.default = _default;
//# sourceMappingURL=FlingGestureHandler.js.map