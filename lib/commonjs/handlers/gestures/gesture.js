"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ContinousBaseGesture = exports.BaseGesture = exports.Gesture = exports.CALLBACK_TYPE = void 0;

var _handlersRegistry = require("../handlersRegistry");

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

const CALLBACK_TYPE = {
  UNDEFINED: 0,
  BEGAN: 1,
  START: 2,
  UPDATE: 3,
  CHANGE: 4,
  END: 5,
  FINALIZE: 6,
  TOUCHES_DOWN: 7,
  TOUCHES_MOVE: 8,
  TOUCHES_UP: 9,
  TOUCHES_CANCELLED: 10
}; // Allow using CALLBACK_TYPE as object and type
// eslint-disable-next-line @typescript-eslint/no-redeclare

exports.CALLBACK_TYPE = CALLBACK_TYPE;

class Gesture {}

exports.Gesture = Gesture;

class BaseGesture extends Gesture {
  constructor(...args) {
    super(...args);

    _defineProperty(this, "handlerTag", -1);

    _defineProperty(this, "handlerName", '');

    _defineProperty(this, "config", {});

    _defineProperty(this, "handlers", {
      handlerTag: -1,
      isWorklet: [false, false, false, false]
    });
  }

  addDependency(key, gesture) {
    const value = this.config[key];
    this.config[key] = value ? Array().concat(value, gesture) : [gesture];
  }

  withRef(ref) {
    this.config.ref = ref;
    return this;
  } // eslint-disable-next-line @typescript-eslint/ban-types


  isWorklet(callback) {
    //@ts-ignore if callback is a worklet, the property will be available, if not then the check will return false
    return callback.__workletHash !== undefined;
  }

  onBegin(callback) {
    this.handlers.onBegin = callback;
    this.handlers.isWorklet[CALLBACK_TYPE.BEGAN] = this.isWorklet(callback);
    return this;
  }

  onStart(callback) {
    this.handlers.onStart = callback;
    this.handlers.isWorklet[CALLBACK_TYPE.START] = this.isWorklet(callback);
    return this;
  }

  onEnd(callback) {
    this.handlers.onEnd = callback; //@ts-ignore if callback is a worklet, the property will be available, if not then the check will return false

    this.handlers.isWorklet[CALLBACK_TYPE.END] = this.isWorklet(callback);
    return this;
  }

  onFinalize(callback) {
    this.handlers.onFinalize = callback; //@ts-ignore if callback is a worklet, the property will be available, if not then the check will return false

    this.handlers.isWorklet[CALLBACK_TYPE.FINALIZE] = this.isWorklet(callback);
    return this;
  }

  onTouchesDown(callback) {
    this.config.needsPointerData = true;
    this.handlers.onTouchesDown = callback;
    this.handlers.isWorklet[CALLBACK_TYPE.TOUCHES_DOWN] = this.isWorklet(callback);
    return this;
  }

  onTouchesMove(callback) {
    this.config.needsPointerData = true;
    this.handlers.onTouchesMove = callback;
    this.handlers.isWorklet[CALLBACK_TYPE.TOUCHES_MOVE] = this.isWorklet(callback);
    return this;
  }

  onTouchesUp(callback) {
    this.config.needsPointerData = true;
    this.handlers.onTouchesUp = callback;
    this.handlers.isWorklet[CALLBACK_TYPE.TOUCHES_UP] = this.isWorklet(callback);
    return this;
  }

  onTouchesCancelled(callback) {
    this.config.needsPointerData = true;
    this.handlers.onTouchesCancelled = callback;
    this.handlers.isWorklet[CALLBACK_TYPE.TOUCHES_CANCELLED] = this.isWorklet(callback);
    return this;
  }

  enabled(enabled) {
    this.config.enabled = enabled;
    return this;
  }

  shouldCancelWhenOutside(value) {
    this.config.shouldCancelWhenOutside = value;
    return this;
  }

  hitSlop(hitSlop) {
    this.config.hitSlop = hitSlop;
    return this;
  }

  simultaneousWithExternalGesture(...gestures) {
    for (const gesture of gestures) {
      this.addDependency('simultaneousWith', gesture);
    }

    return this;
  }

  requireExternalGestureToFail(...gestures) {
    for (const gesture of gestures) {
      this.addDependency('requireToFail', gesture);
    }

    return this;
  }

  initialize() {
    this.handlerTag = (0, _handlersRegistry.getNextHandlerTag)();
    this.handlers = { ...this.handlers,
      handlerTag: this.handlerTag
    };

    if (this.config.ref) {
      this.config.ref.current = this;
    }
  }

  toGestureArray() {
    return [this];
  } // eslint-disable-next-line @typescript-eslint/no-empty-function


  prepare() {}

}

exports.BaseGesture = BaseGesture;

class ContinousBaseGesture extends BaseGesture {
  onUpdate(callback) {
    this.handlers.onUpdate = callback;
    this.handlers.isWorklet[CALLBACK_TYPE.UPDATE] = this.isWorklet(callback);
    return this;
  }

  onChange(callback) {
    this.handlers.onChange = callback;
    this.handlers.isWorklet[CALLBACK_TYPE.CHANGE] = this.isWorklet(callback);
    return this;
  }

  manualActivation(manualActivation) {
    this.config.manualActivation = manualActivation;
    return this;
  }

}

exports.ContinousBaseGesture = ContinousBaseGesture;
//# sourceMappingURL=gesture.js.map