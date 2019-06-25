import Hammer from 'hammerjs';
import { findNodeHandle } from 'react-native';
import State from './State';

const MULTI_FINGER_PAN_MAX_PINCH_THRESHOLD = 0.1;
const MULTI_FINGER_PAN_MAX_ROTATION_THRESHOLD = 7;
const DEG_RAD = Math.PI / 180;

// Used for sending data to a callback or AnimatedEvent
function invokeNullableMethod(name, method, event) {
  if (method) {
    if (typeof method === 'function') {
      method(event);
    } else {
      // For use with reanimated's AnimatedEvent
      if (
        '__getHandler' in method &&
        typeof method.__getHandler === 'function'
      ) {
        const handler = method.__getHandler();
        invokeNullableMethod(name, handler, event);
      } else {
        if ('__nodeConfig' in method) {
          const { argMapping } = method.__nodeConfig;
          if (Array.isArray(argMapping)) {
            for (const index in argMapping) {
              const [key] = argMapping[index];
              if (key in event.nativeEvent) {
                method.__nodeConfig.argMapping[index] = [
                  key,
                  event.nativeEvent[key],
                ];
              }
            }
          }
        }
      }
    }
  }
}

// Validate the props
function ensureConfig(config) {
  const props = { ...config };

  if ('minDeltaX' in config) {
    console.warn('minDeltaX is deprecated in favor of activeOffsetX');
    props.activeOffsetX = getLegacyRangeValue(config.minDeltaX);
  }
  if ('minDeltaY' in config) {
    console.warn('minDeltaY is deprecated in favor of activeOffsetY');
    props.activeOffsetY = getLegacyRangeValue(config.minDeltaY);
  }

  if ('activeOffsetX' in config) {
    props.activeOffsetX = getRangeValue(config.activeOffsetX);
  }
  if ('activeOffsetY' in config) {
    props.activeOffsetY = getRangeValue(config.activeOffsetY);
  }

  if ('minDist' in config) {
    props.minDist = config.minDist;
  }

  if ('maxDeltaX' in config) {
    console.warn('maxDeltaX is deprecated in favor of failOffsetX');
    props.failOffsetX = getLegacyRangeValue(config.maxDeltaX);
  }

  if ('maxDeltaY' in config) {
    console.warn('maxDeltaY is deprecated in favor of failOffsetY');
    props.failOffsetY = getLegacyRangeValue(config.maxDeltaY);
  }
  if ('maxDist' in config) {
    props.maxDist = getLegacyRangeValue(config.maxDist);
  }

  if ('failOffsetX' in config) {
    props.failOffsetX = getRangeValue(config.failOffsetX);
  } else {
    props.failOffsetX = getRangeValue(Infinity);
  }

  if ('failOffsetY' in config) {
    props.failOffsetY = getRangeValue(config.failOffsetY);
  } else {
    props.failOffsetY = getRangeValue(Infinity);
  }

  if (!('minPointers' in config)) {
    props.minPointers = 1;
  }

  props.maxPointers = Math.max(
    config.minPointers || 0,
    config.maxPointers || 0
  );

  if (config.minPointers <= 0) {
    throw new Error('minPointers must be larger than 0');
  }

  return props;
}

// Ensure the ranges work the same as native
function getRangeValue(value) {
  if (Array.isArray(value)) {
    if (!value.length || value.length > 2) {
      throw new Error('Range value must only contain 2 values');
    } else if (value.length === 1) {
      return getRangeValue(value[0]);
    }
    return value;
  } else {
    return value < 0 ? [value, Infinity] : [-Infinity, value];
  }
}

function getLegacyRangeValue(value) {
  if (Array.isArray(value)) {
    if (!value.length || value.length > 2) {
      throw new Error('Range value must only contain 2 values');
    } else if (value.length === 1) {
      return getLegacyRangeValue(value[0]);
    }
    return value;
  } else {
    return value < 0 ? [value, -value] : [-value, value];
  }
}

const valueInRange = (value, range) => value >= range[0] && value <= range[1];

const valueOutOfRange = (value, range) =>
  value <= range[0] || value >= range[1];

const getVectorLength = (x, y) => Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));

function validateCriteria(
  { recognizer, pointerLength, velocity, vx, vy, dx, dy, ...inputData },
  {
    minPointers,
    maxPointers,
    minDist,
    minVelocity,
    minVelocityX,
    minVelocityY,
    failOffsetX,
    failOffsetY,
    activeOffsetX,
    activeOffsetY,
  }
) {
  const validPointerCount =
    pointerLength >= minPointers && pointerLength <= maxPointers;

  let isFastEnough = Math.abs(velocity) >= minVelocity;

  if (
    isFastEnough &&
    typeof minVelocityX !== 'undefined' &&
    Math.abs(vx) < minVelocityX
  ) {
    isFastEnough = false;
  }
  if (
    isFastEnough &&
    typeof minVelocityY !== 'undefined' &&
    Math.abs(vy) < minVelocityY
  ) {
    isFastEnough = false;
  }

  let isWithinBounds =
    valueInRange(dx, failOffsetX) && valueInRange(dy, failOffsetY);

  let isLongEnough = true;
  // Order here matters for parity reasons.
  if (isLongEnough && minDist != null) {
    isLongEnough = getVectorLength(dx, dy) >= minDist;
  }

  if (isLongEnough && activeOffsetX) {
    isLongEnough = valueOutOfRange(dx, activeOffsetX);
  }

  if (isLongEnough && activeOffsetY) {
    isLongEnough = valueOutOfRange(dy, activeOffsetY);
  }

  // We only use validateCriteria for panning.
  // If this changes, then we'll need to check for the gesture type.
  if (validPointerCount && pointerLength > 1) {
    // Test if the pan had too much pinching or rotating.
    const deltaScale = Math.abs(inputData.scale - 1);
    const deltaRotation = Math.abs(inputData.deltaRotation);
    if (deltaScale > MULTI_FINGER_PAN_MAX_PINCH_THRESHOLD) {
      // > If the threshold doesn't seem right.
      // You can log the value which it failed at here:
      // console.log('Pan failed: scale: ', deltaScale);

      return {
        success: false,
        failed: true,
      };
    }
    if (deltaRotation > MULTI_FINGER_PAN_MAX_ROTATION_THRESHOLD) {
      // > If the threshold doesn't seem right.
      // You can log the value which it failed at here:
      // console.log('Pan failed: rotate: ', deltaRotation);
      return {
        success: false,
        failed: true,
      };
    }
  }

  return {
    success:
      validPointerCount && isFastEnough && isWithinBounds && isLongEnough,
    failed: !isWithinBounds,
  };
}

function asArray(value) {
  return value == null ? [] : Array.isArray(value) ? value : [value];
}

function panDirectionForConfig({ activeOffsetX, activeOffsetY, minDist }) {
  let directions = [];
  let horizontalDirections = [];

  // sigh
  if (minDist != null) {
    return Hammer.DIRECTION_ALL;
  }

  if (activeOffsetX) {
    if (Math.abs(activeOffsetX[0]) !== Infinity)
      horizontalDirections.push(Hammer.DIRECTION_LEFT);
    if (Math.abs(activeOffsetX[1]) !== Infinity)
      horizontalDirections.push(Hammer.DIRECTION_RIGHT);
    if (horizontalDirections.length === 2)
      horizontalDirections = [Hammer.DIRECTION_HORIZONTAL];
    directions = directions.concat(horizontalDirections);
  }
  let verticalDirections = [];
  if (activeOffsetY) {
    if (Math.abs(activeOffsetY[0]) !== Infinity)
      verticalDirections.push(Hammer.DIRECTION_UP);
    if (Math.abs(activeOffsetY[1]) !== Infinity)
      verticalDirections.push(Hammer.DIRECTION_DOWN);
    if (verticalDirections.length === 2)
      verticalDirections = [Hammer.DIRECTION_VERTICAL];
    directions = directions.concat(verticalDirections);
  }

  if (!directions.length) {
    return Hammer.DIRECTION_NONE;
  }
  if (
    directions[0] === Hammer.DIRECTION_HORIZONTAL &&
    directions[1] === Hammer.DIRECTION_VERTICAL
  ) {
    return Hammer.DIRECTION_ALL;
  }
  if (horizontalDirections.length && verticalDirections.length) {
    return Hammer.DIRECTION_ALL;
  }

  return directions[0];
}

class GestureHandler {
  isGestureRunning = false;
  hasGestureFailed = false;
  view = null;
  config = {};
  hammer = null;

  enabled() {
    return { success: true };
  }

  filter(nativeEvent) {
    return nativeEvent;
  }

  start({ manager, props }) {
    throw new Error('Must override GestureHandler.start()');
  }

  update({ enabled = true, ...props }) {
    this.config = ensureConfig({ enabled, ...props });
    if (this.hammer) {
      this.sync();
    }
  }

  destroy = () => {
    if (this.hammer) {
      this.hammer.stop();
      this.hammer.destroy();
    }
    this.hammer = null;
  };

  getState(type) {
    return EventMap[type];
  }

  oldState = State.UNDETERMINED;
  previousState = State.UNDETERMINED;
  initialRotation = 0;

  _transformEventData = ev => {
    const {
      eventType,
      deltaX,
      deltaY,
      velocityX,
      velocityY,
      velocity,
      center,
      rotation,
      scale,
      maxPointers: numberOfPointers,
    } = ev;

    let deltaRotation = (rotation - this.initialRotation) * DEG_RAD;

    const state = this.getState(eventType);
    const direction = DirectionMap[ev.direction];
    if (state !== this.previousState) {
      this.oldState = this.previousState;
      this.previousState = state;
    }
    const nativeEvent = {
      direction,
      oldState: this.oldState,
      translationX: deltaX - (this.__initialX || 0),
      translationY: deltaY - (this.__initialY || 0),
      velocityX,
      velocityY,
      velocity,
      rotation: deltaRotation,
      scale,

      x: center.x,
      y: center.y,
      absoluteX: center.x,
      absoluteY: center.y,
      focalX: center.x,
      focalY: center.y,
      anchorX: center.x,
      anchorY: center.y,
    };

    const timeStamp = Date.now();
    const event = {
      nativeEvent: {
        numberOfPointers,
        state,
        ...this.filter(nativeEvent),

        // onHandlerStateChange only
        handlerTag: this.handlerTag,
        target: this.ref,
        oldState: this.oldState,
      },
      timeStamp,
    };

    return event;
  };

  _sendEvent = ev => {
    console.log('tap-send', ev.isFinal);
    const {
      onGestureHandlerStateChange: onHandlerStateChange,
      onGestureHandlerEvent: onGestureEvent,
    } = this.ref.props;

    const event = this._transformEventData(ev);

    if (ev.isFinal) {
      this.oldState = State.UNDETERMINED;
      this.previousState = State.UNDETERMINED;
    }

    invokeNullableMethod('onGestureEvent', onGestureEvent, event);
    invokeNullableMethod('onHandlerStateChange', onHandlerStateChange, event);
  };

  _onEnd = event => {
    this.isGestureRunning = false;
    console.log('Tap.end');
  };

  setRef = ref => {
    if (ref == null) {
      this._destroy();
      this.view = null;
      return;
    }

    this.ref = ref;

    this.view = findNodeHandle(ref);
    this.hammer = new Hammer(this.view, {
      // touchAction: 'pan-right'
    });

    this.oldState = State.UNDETERMINED;
    this.previousState = State.UNDETERMINED;
    this.initialRotation = 0;

    this.start({ manager: this.hammer, props: this.config });

    const onStart = ({ deltaX, deltaY, rotation }) => {
      this.isGestureRunning = true;
      this.__initialX = deltaX;
      this.__initialY = deltaY;
      this.initialRotation = rotation;
    };

    this.hammer.on(
      'hammer.input',
      ({ isFirst, rotation, isFinal, ...props }) => {
        if (isFirst) {
          this.hasGestureFailed = false;
        }

        // Attempt to create a touch-down event by checking if a valid tap hasn't started yet, then validating the input.
        if (this.name === 'tap') {
          if (!this.hasGestureFailed && !this.isGestureRunning) {
            // Tap Gesture start event
            const gesture = this.hammer.get(this.name);
            const inputData = { isFirst, rotation, isFinal, ...props };
            if (gesture.options.enable(gesture, inputData)) {
              console.log('Tap.start', inputData);
              onStart({ isFirst, rotation, isFinal, ...props });
              this._sendEvent({ isFirst, rotation, isFinal, ...props });
            }
          }
        }
        // TODO: Bacon: Check against something other than null
        // The isFirst value is not called when the first rotation is calculated.
        if (this.__initialRotation === null && rotation !== 0) {
          this.__initialRotation = rotation;
        }
        if (isFinal) {
          // in favor of a willFail otherwise the last frame of the gesture will be captured.
          setTimeout(() => {
            this.__initialRotation = null;
            this.hasGestureFailed = false;
          });
        }
      }
    );

    if (this.name !== 'tap') {
      this.hammer.on(`${this.name}start`, onStart);
    }

    if (this.name === 'press') {
      this.hammer.on(`${this.name}up`, () => {
        this._onEnd();
      });
    } else {
      this.hammer.on(`${this.name}end ${this.name}cancel`, () => {
        this._onEnd();
      });
    }

    this.hammer.on(this.name, ev => {
      if (this.name === 'tap') {
        console.log('Tap.active', ev);
        if (ev.eventType === Hammer.INPUT_END) {
          this._sendEvent({ ...ev, eventType: Hammer.INPUT_MOVE });
        }
        // When handler gets activated it will turn into State.END immediately.
        this._sendEvent({ ...ev, isFinal: true });
        this._onEnd();
      } else {
        this._sendEvent(ev);
      }
    });
    this.sync();
  };

  sync = () => {
    const gesture = this.hammer.get(this.name);

    if (!gesture) return;

    gesture.set({
      direction:
        this.name === 'pan' ? panDirectionForConfig(this.config) : undefined,
      pointers:
        this.config.minPointers === this.config.maxPointers
          ? this.config.minPointers
          : 0,
      enable: (recognizer, inputData = {}) => {
        if (!this.config.enabled) {
          this.isGestureRunning = false;
          this.hasGestureFailed = false;
          return false;
        }

        if (this.hasGestureFailed) {
          return false;
        }
        if (this.isGestureRunning && this.name !== 'tap') {
          return true;
        }

        // The built-in hammer.js "waitFor" doesn't work across multiple views.
        const waitFor = asArray(this.config.waitFor)
          .map(({ current }) => current)
          .filter(v => v);

        // Only process if there are views to wait for.
        if (waitFor.length) {
          // Get the list of gestures that this gesture is still waiting for.
          // Use `=== false` in case a ref that isn't a gesture handler is used.
          const stillWaiting = waitFor.filter(
            gesture => gesture.hasGestureFailed === false
          );

          // Check to see if one of the gestures you're waiting for has started.
          // If it has then the gesture should fail.
          for (const gesture of stillWaiting) {
            // When the target gesture has started, this gesture must force fail.
            if (gesture.isGestureRunning) {
              // console.log('Force fail: ', input.name);
              this.hasGestureFailed = true;
              this.isGestureRunning = false;
              return false;
            }
          }

          // This gesture should continue waiting.
          if (stillWaiting.length) {
            return false;
          }
        }

        if (!inputData || !recognizer.options) {
          return true;
        }

        const { success, failed } = this.enabled(this.config, recognizer, {
          ...inputData,
          deltaRotation:
            this.__initialRotation == null
              ? 0
              : inputData.rotation - this.__initialRotation,
        });

        if (failed) {
          // Simulate cancel event
          if (this.name === 'tap' && this.isGestureRunning) {
            this._sendEvent({
              ...inputData,
              eventType: Hammer.INPUT_CANCEL,
              isFinal: true,
            });
            this._onEnd({
              ...inputData,
            });
          }
          this.hasGestureFailed = true;
        }
        return success;
      },
    });
  };
}

class RotationGestureHandler extends GestureHandler {
  name = 'rotate';

  update({ minPointers = 2, maxPointers = 2, ...props }) {
    return super.update({
      minPointers,
      maxPointers,
      ...props,
    });
  }

  start({ manager, props }) {
    manager.add(new Hammer.Rotate({ pointers: props.minPointers }));
  }

  filter({ anchorX, anchorY, velocity, rotation }) {
    return {
      anchorX,
      anchorY,
      velocity,
      rotation,
    };
  }
}

class PinchGestureHandler extends GestureHandler {
  name = 'pinch';

  update({ minPointers = 2, maxPointers = 2, ...props }) {
    return super.update({
      minPointers,
      maxPointers,
      ...props,
    });
  }

  start({ manager, props }) {
    manager.add(new Hammer.Pinch({ pointers: props.minPointers }));
  }

  filter({ scale, velocity, focalX, focalY }) {
    return {
      scale,
      velocity,
      focalX,
      focalY,
    };
  }
}

class PanGestureHandler extends GestureHandler {
  name = 'pan';

  update({
    minVelocity = 0,
    minVelocityX = 0,
    minVelocityY = 0,
    minPointers = 1,
    maxPointers = 1,
    ...props
  }) {
    return super.update({
      minVelocity,
      minVelocityX,
      minVelocityY,
      minPointers,
      maxPointers,
      ...props,
    });
  }

  enabled(props, recognizer, inputData) {
    return validateCriteria(
      {
        ...inputData,
        recognizer,
        pointerLength: inputData.maxPointers,
        velocity: inputData.overallVelocity,
        vx: inputData.velocityX,
        vy: inputData.velocityY,
        dx: inputData.deltaX,
        dy: inputData.deltaY,
      },
      props
    );
  }

  filter({
    translationX,
    translationY,
    velocityX,
    velocityY,
    x,
    y,
    absoluteX,
    absoluteY,
  }) {
    return {
      translationX,
      translationY,
      velocityX,
      velocityY,
      x,
      y,
      absoluteX,
      absoluteY,
    };
  }

  start({ manager, props }) {
    manager.add(
      new Hammer.Pan({
        pointers: props.minPointers,
      })
    );
  }
}

class TapGestureHandler extends GestureHandler {
  name = 'tap';

  update({
    minDurationMs: time = 250,
    numberOfTaps: tapCount = 1,
    maxDelayMs: interval = 300,
    maxDist = 2,
    minPointers = 1,
    maxPointers = 1,
    ...props
  }) {
    console.log('update', {
      time,
      tapCount,
      interval,
      maxDist,
      minPointers,
      maxPointers,
      ...props,
    });

    return super.update({
      time,
      tapCount,
      interval,
      maxDist,
      minPointers,
      maxPointers,
      ...props,
    });
  }

  enabled(
    { minPointers, maxPointers, maxDist },
    recognizer,
    { maxPointers: pointerLength, deltaX: dx, deltaY: dy }
  ) {
    if (typeof pointerLength === 'undefined') {
      return { success: true };
    }

    const validPointerCount =
      pointerLength >= minPointers && pointerLength <= maxPointers;
    const isWithinBounds =
      valueInRange(dx, maxDist) && valueInRange(dy, maxDist);

    console.log(
      'Tap.enable:',
      dx,
      dy,
      isWithinBounds,
      validPointerCount,
      pointerLength,
      minPointers,
      maxPointers
    );
    if (!isWithinBounds) {
      return { failed: true };
    }

    // A user probably won't land a multi-pointer tap on the first tick (so we cannot just cancel each time)
    // but if the gesture is running and the user adds or subtracts another pointer then it should fail.
    if (!validPointerCount && this.isGestureRunning) {
      return { failed: true };
    }
    return { success: validPointerCount };
    // return { failed: true };
  }

  start({ manager, props }) {
    manager.add(new Hammer.Tap({ pointers: props.minPointers }));
  }

  filter({ x, y, absoluteX, absoluteY }) {
    return {
      x,
      y,
      absoluteX,
      absoluteY,
    };
  }
}
class LongPressGestureHandler extends GestureHandler {
  name = 'press';

  getState(type) {
    return {
      [Hammer.INPUT_START]: State.ACTIVE,
      [Hammer.INPUT_MOVE]: State.ACTIVE,
      [Hammer.INPUT_END]: State.END,
      [Hammer.INPUT_CANCEL]: State.FAILED,
    }[type];
  }

  update({
    minDurationMs: time = 251,
    maxDist: threshold = 9,
    minPointers = 1,
    maxPointers = 1,
    ...props
  }) {
    return super.update({
      time,
      threshold,
      minPointers,
      maxPointers,
      ...props,
    });
  }

  start({ manager, props }) {
    manager.add(new Hammer.Press({ pointers: props.minPointers }));
  }

  filter({ scale, velocity, focalX, focalY }) {
    return {
      scale,
      velocity,
      focalX,
      focalY,
    };
  }
}

class UnimplementedGestureHandler extends GestureHandler {
  start() {}
}

const Gestures = {
  PanGestureHandler,
  RotationGestureHandler,
  PinchGestureHandler,
  TapGestureHandler,
  LongPressGestureHandler,
  ForceTouchGestureHandler: UnimplementedGestureHandler,
  FlingGestureHandler: UnimplementedGestureHandler,
  NativeViewHandler: UnimplementedGestureHandler,
};

let _gestureCache = {};

const Module = {
  get Directions() {
    return {
      RIGHT: 1,
      LEFT: 2,
      UP: 4,
      DOWN: 8,
    };
  },
  handleSetJSResponder(tag, blockNativeResponder) {
    console.warn('handleSetJSResponder: ', tag, blockNativeResponder);
  },
  handleClearJSResponder() {
    console.warn('handleClearJSResponder: ');
  },
  createGestureHandler(handlerName, handlerTag, config) {
    const GestureClass = Gestures[handlerName] || UnimplementedGestureHandler;
    if (handlerTag in _gestureCache) {
      throw new Error('Handler with tag ' + handlerTag + ' already exists');
    }
    _gestureCache[handlerTag] = new GestureClass();
    _gestureCache[handlerTag].handlerTag = handlerTag;
    this.updateGestureHandler(handlerTag, config);
  },
  attachGestureHandler(handlerTag, newViewTag) {
    getHandler(handlerTag).setRef(newViewTag);
  },
  updateGestureHandler(handlerTag, newConfig) {
    getHandler(handlerTag).update(newConfig);
  },
  dropGestureHandler(handlerTag) {
    getHandler(handlerTag).destroy();
    delete _gestureCache[handlerTag];
  },
};

const getHandler = tag => {
  if (tag in _gestureCache) return _gestureCache[tag];

  throw new Error('No handler for tag ' + tag);
};

// Map Hammer values to RNGH
const EventMap = {
  [Hammer.INPUT_START]: State.BEGAN,
  [Hammer.INPUT_MOVE]: State.ACTIVE,
  [Hammer.INPUT_END]: State.END,
  [Hammer.INPUT_CANCEL]: State.FAILED,
};

const DirectionMap = {
  [Hammer.DIRECTION_RIGHT]: Module.Directions.RIGHT,
  [Hammer.DIRECTION_LEFT]: Module.Directions.LEFT,
  [Hammer.DIRECTION_UP]: Module.Directions.UP,
  [Hammer.DIRECTION_DOWN]: Module.Directions.DOWN,
};

export default Module;
