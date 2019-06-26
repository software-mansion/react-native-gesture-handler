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
      if ('__getHandler' in method && typeof method.__getHandler === 'function') {
        const handler = method.__getHandler();
        invokeNullableMethod(name, handler, event);
      } else {
        if ('__nodeConfig' in method) {
          const { argMapping } = method.__nodeConfig;
          if (Array.isArray(argMapping)) {
            for (const index in argMapping) {
              const [key] = argMapping[index];
              if (key in event.nativeEvent) {
                method.__nodeConfig.argMapping[index] = [key, event.nativeEvent[key]];
              }
            }
          }
        }
      }
    }
  }
}

// const bindNumericValue = (key, config) => {
//   if (key in config && config[key] != null) return config[key];
//   return Number.isNaN;
// };
// Validate the props
function ensureConfig(config) {
  const props = { ...config };

  if ('minDist' in config) {
    props.minDist = config.minDist;
    props.minDistSq = props.minDist * props.minDist;
  }
  if ('minVelocity' in config) {
    props.minVelocity = config.minVelocity;
    props.minVelocitySq = props.minVelocity * props.minVelocity;
  }
  if ('maxDist' in config) {
    props.maxDist = config.maxDist;
    props.maxDistSq = config.maxDist * config.maxDist;
  }
  // if (!('minPointers' in config)) {
  //   props.minPointers = 1;
  // }

  // props.maxPointers = Math.max(config.minPointers || 0, config.maxPointers || 0);

  // if (config.minPointers <= 0) {
  //   throw new Error('minPointers must be larger than 0');
  // }

  if ('waitFor' in config) {
    props.waitFor = asArray(config.waitFor)
      .map(({ _handlerTag }) => Module.getGestureHandlerNode(_handlerTag))
      .filter(v => v);
  } else {
    props.waitFor = null;
  }

  [
    'minPointers',
    'maxPointers',
    'minDist',
    'maxDist',
    'maxDistSq',
    'minVelocitySq',
    'minDistSq',
    'minVelocity',
    'failOffsetXStart',
    'failOffsetYStart',
    'failOffsetXEnd',
    'failOffsetYEnd',
    'activeOffsetXStart',
    'activeOffsetXEnd',
    'activeOffsetYStart',
    'activeOffsetYEnd',
  ].forEach(prop => {
    if (isUndefined(props[prop])) {
      props[prop] = Number.NaN;
    }
  });

  return props;
}

// Ensure the ranges work the same as native
// function getRangeValue(value) {
//   if (Array.isArray(value)) {
//     if (!value.length || value.length > 2) {
//       throw new Error('Range value must only contain 2 values');
//     } else if (value.length === 1) {
//       return getRangeValue(value[0]);
//     }
//     return value;
//   } else {
//     return value < 0 ? [value, Number.MAX_SAFE_INTEGER] : [-Number.MAX_SAFE_INTEGER, value];
//   }
// }

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

// const valueInRange = (value, range) => value >= range[0] && value <= range[1];

// const valueOutOfRange = (value, range) => value <= range[0] || value >= range[1];

// const getVectorLength = (x, y) => Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));

// function validateCriteria(
//   { recognizer, pointerLength, velocity, vx, vy, dx, dy, ...inputData },
//   {
//     minPointers,
//     maxPointers,
//     minDist,
//     minVelocity,
//     minVelocityX,
//     minVelocityY,
//     failOffsetXStart,
//     failOffsetXEnd,
//     failOffsetYStart,
//     failOffsetYEnd,
//     activeOffsetXStart,
//     activeOffsetXEnd,
//     activeOffsetYStart,
//     activeOffsetYEnd,
//   }
// ) {
//   if (isUndefined(pointerLength)) {
//     return { success: true };
//   }
//   const validPointerCount = pointerLength >= minPointers && pointerLength <= maxPointers;

//   let isFastEnough = Math.abs(velocity) >= minVelocity;

//   if (isFastEnough && typeof minVelocityX !== 'undefined' && Math.abs(vx) < minVelocityX) {
//     isFastEnough = false;
//   }
//   if (isFastEnough && typeof minVelocityY !== 'undefined' && Math.abs(vy) < minVelocityY) {
//     isFastEnough = false;
//   }

//   let isWithinBounds =
//     valueInRange(dx, [failOffsetXStart, failOffsetXEnd]) &&
//     valueInRange(dy, [failOffsetYStart, failOffsetYEnd]);

//   if (!isWithinBounds) {
//     console.log('OOB', dx, [failOffsetXStart, failOffsetXEnd], dy, [
//       failOffsetYStart,
//       failOffsetYEnd,
//     ]);
//     return { failed: true };
//   }

//   let isLongEnough = true;
//   // Order here matters for parity reasons.
//   if (isLongEnough && minDist != null) {
//     isLongEnough = getVectorLength(dx, dy) >= minDist;
//   }

//   if (isLongEnough) {
//     isLongEnough = valueOutOfRange(dx, [activeOffsetXStart, activeOffsetXEnd]);
//   }

//   if (isLongEnough) {
//     isLongEnough = valueOutOfRange(dy, [activeOffsetYStart, activeOffsetYEnd]);
//   }
//   console.log('Test', isLongEnough);

//   // console.log("TEST", {
//   //   failOffsetXStart, failOffsetXEnd,
//   //   failOffsetYStart, failOffsetYEnd,
//   //   activeOffsetXStart, activeOffsetXEnd,
//   //   activeOffsetYStart, activeOffsetYEnd,
//   // })

//   // We only use validateCriteria for panning.
//   // If this changes, then we'll need to check for the gesture type.
//   if (validPointerCount && pointerLength > 1) {
//     // Test if the pan had too much pinching or rotating.
//     const deltaScale = Math.abs(inputData.scale - 1);
//     const deltaRotation = Math.abs(inputData.deltaRotation);
//     if (deltaScale > MULTI_FINGER_PAN_MAX_PINCH_THRESHOLD) {
//       // > If the threshold doesn't seem right.
//       // You can log the value which it failed at here:
//       // console.log('Pan failed: scale: ', deltaScale);

//       return {
//         success: false,
//         failed: true,
//       };
//     }
//     if (deltaRotation > MULTI_FINGER_PAN_MAX_ROTATION_THRESHOLD) {
//       // > If the threshold doesn't seem right.
//       // You can log the value which it failed at here:
//       // console.log('Pan failed: rotate: ', deltaRotation);
//       return {
//         success: false,
//         failed: true,
//       };
//     }
//   }

//   return {
//     success: validPointerCount && isFastEnough && isLongEnough,
//   };
// }

function asArray(value) {
  return value == null ? [] : Array.isArray(value) ? value : [value];
}

const eventTypes = {
  [Hammer.INPUT_START]: 'START',
  [Hammer.INPUT_MOVE]: 'MOVE',
  [Hammer.INPUT_END]: 'END',
  [Hammer.INPUT_CANCEL]: 'CANCEL',
};
const dirrs = {
  [Hammer.DIRECTION_HORIZONTAL]: 'HORIZONTAL',
  [Hammer.DIRECTION_UP]: 'UP',
  [Hammer.DIRECTION_DOWN]: 'DOWN',
  [Hammer.DIRECTION_VERTICAL]: 'VERTICAL',
  [Hammer.DIRECTION_NONE]: 'NONE',
  [Hammer.DIRECTION_ALL]: 'ALL',
  [Hammer.DIRECTION_RIGHT]: 'RIGHT',
  [Hammer.DIRECTION_LEFT]: 'LEFT',
};

const isUndefined = v => typeof v === 'undefined';

let _gestureInstances = 0;

class GestureHandler {
  get isDiscrete() {
    return false;
  }

  constructor() {
    this._gestureInstance = _gestureInstances++;
  }

  get id() {
    return `${this.name}${this._gestureInstance}`;
  }

  getConfig() {
    return this.config;
  }

  isGestureRunning = false;
  hasGestureFailed = false;
  view = null;
  config = {};
  hammer = null;
  pendingGestures = {};

  onWaitingEnded(gesture) {
    console.warn('onWaitingEnded!', gesture.id);
  }

  removePendingGesture(id) {
    delete this.pendingGestures[id];
  }
  
  addPendingGesture(gesture) {
    this.pendingGestures[gesture.id] = gesture;
  }

  enabled() {
    return { success: true };
  }

  filter(nativeEvent) {
    return nativeEvent;
  }

  start({ manager, props }) {
    throw new Error('Must override GestureHandler.start()');
  }

  updateHasCustomActivationCriteria(config) {
    return true;
  }

  _clearSelfAsPending = () => {
    if (Array.isArray(this.config.waitFor)) {
      for (const gesture of this.config.waitFor) {
        gesture.removePendingGesture(this.id);
      }
    }
  };

  update({ enabled = true, ...props }) {
    this._clearSelfAsPending();

    this.config = ensureConfig({ enabled, ...props });
    this._hasCustomActivationCriteria = this.updateHasCustomActivationCriteria(this.config);
    console.log('Gesture.update', this.config, this._hasCustomActivationCriteria);
    if (Array.isArray(this.config.waitFor)) {
      for (const gesture of this.config.waitFor) {
        gesture.addPendingGesture(this);
      }
    }

    if (this.hammer) {
      this.sync();
    }
    return this.config;
  }

  destroy = () => {
    this._clearSelfAsPending();

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

  _onEnd(event) {
    this.isGestureRunning = false;
    for (const gesture of Object.values(this.pendingGestures)) {
      if (gesture.isGestureRunning) {
        gesture.hasGestureFailed = true;
        // TODO: Send Event
        gesture._cancelEvent(event);
      }
    }
    console.log(`${this.name}.end`);
  }

  _cancelEvent = event => {
    for (const gesture of Object.values(this.pendingGestures)) {
      gesture.onWaitingEnded(this);
    }
    this._sendEvent({
      ...event,
      eventType: Hammer.INPUT_CANCEL,
      isFinal: true,
    });
    this._onEnd({
      ...event,
    });
  };

  onRawEvent(ev) {
    const { isFirst, rotation, isFinal, ...props } = ev;
  
    if (isFirst) {
      this.hasGestureFailed = false;
    }

    // Attempt to create a touch-down event by checking if a valid tap hasn't started yet, then validating the input.
    if (this.name === 'tap') {
      if (
        !this.hasGestureFailed &&
        !this.isGestureRunning &&
        // Prevent multi-pointer events from misfiring.
        !isFinal
      ) {
        // Tap Gesture start event
        const gesture = this.hammer.get(this.name);
        if (gesture.options.enable(gesture, ev)) {
          console.log(`${this.name}.start`);
          clearTimeout(this._multiTapTimer);

          this.onStart(ev);
          this._sendEvent(ev);
        }
      }
      if (isFinal && props.maxPointers > 1) {
        setTimeout(() => {
          // Handle case where one finger presses slightly
          // after the first finger on a multi-tap event
          if (this.isGestureRunning) {
            this._cancelEvent(ev);
          }
        });
      }
    }
  }

  setRef = ref => {
    if (ref == null) {
      this.destroy();
      this.view = null;
      return;
    }

    this.ref = ref;

    this.view = findNodeHandle(ref);
    this.hammer = new Hammer.Manager(this.view);

    this.oldState = State.UNDETERMINED;
    this.previousState = State.UNDETERMINED;
    this.initialRotation = 0;

    this.start({ manager: this.hammer, props: this.getConfig() });

    this.hammer.on('hammer.input', ev => {
      if (!this.config.enabled) {
        this.hasGestureFailed = false;
        this.isGestureRunning = false;
        return;
      }

      this.onRawEvent(ev);

      // TODO: Bacon: Check against something other than null
      // The isFirst value is not called when the first rotation is calculated.
      if (this.__initialRotation === null && ev.rotation !== 0) {
        this.__initialRotation = ev.rotation;
      }
      if (ev.isFinal) {
        // in favor of a willFail otherwise the last frame of the gesture will be captured.
        setTimeout(() => {
          this.__initialRotation = null;
          this.hasGestureFailed = false;
        });
      }    
    });

    this.setupEvents();
    this.sync();
  };

  setupEvents() {
    if (!this.isDiscrete) {
      this.hammer.on(`${this.name}start`, this.onStart);
      this.hammer.on(`${this.name}end ${this.name}cancel`, this._onEnd);
    }
    this.hammer.on(this.name, ev => this.onMainEvent(ev));
  }

  onStart({ deltaX, deltaY, rotation }) {
    this.isGestureRunning = true;
    this.__initialX = deltaX;
    this.__initialY = deltaY;
    this.initialRotation = rotation;
  }

  onMainEvent(ev) {
    console.log(`${this.name}.event`, ev);
    this._sendEvent(ev);
  }


  get shouldEnableGestureOnSetup() {
    throw new Error('Must override GestureHandler.shouldEnableGestureOnSetup');
  }

  onSuccess() {}

  _getPendingGestures() {
    if (Array.isArray(this.config.waitFor) && this.config.waitFor.length) {
      // Get the list of gestures that this gesture is still waiting for.
      // Use `=== false` in case a ref that isn't a gesture handler is used.
      const stillWaiting = this.config.waitFor.filter(
        ({ hasGestureFailed }) => hasGestureFailed === false
      );
      return stillWaiting;
    }
    return [];
  }

  _getHammerConfig() {
    const pointers =
      this.config.minPointers === this.config.maxPointers ? this.config.minPointers : 0;
    return {
      pointers,
    };
  }

  sync = () => {
    const gesture = this.hammer.get(this.name);

    if (!gesture) return;

    const params = this._getHammerConfig();
    console.log('params', params);
    gesture.set({
      ...params,
      enable: (recognizer, inputData = {}) => {
        if (!this.config.enabled) {
          this.isGestureRunning = false;
          this.hasGestureFailed = false;
          return false;
        }

        // Prevent events before the system is ready.
        if (!inputData || !recognizer.options || isUndefined(inputData.maxPointers)) {
          return this.shouldEnableGestureOnSetup;
        }

        if (this.hasGestureFailed) {
          return false;
        }

        if (this.isGestureRunning && !this.isDiscrete) {
          return true;
        }

        if (!this.isDiscrete) {
          // The built-in hammer.js "waitFor" doesn't work across multiple views.
          // Only process if there are views to wait for.
          this._stillWaiting = this._getPendingGestures();
          // This gesture should continue waiting.
          if (stillWaiting.length) {
            // Check to see if one of the gestures you're waiting for has started.
            // If it has then the gesture should fail.
            for (const gesture of stillWaiting) {
              // When the target gesture has started, this gesture must force fail.
              if (!gesture.isDiscrete && gesture.isGestureRunning) {
                // console.log('Force fail: ', input.name);
                this.hasGestureFailed = true;
                this.isGestureRunning = false;
                return false;
              }
            }
            // This gesture shouldn't start until the others have finished.
            return false;
          }
        }

        // Use default behaviour
        if (!this._hasCustomActivationCriteria) {
          return true;
        }

        const deltaRotation =
          this.__initialRotation == null ? 0 : inputData.rotation - this.__initialRotation;
        const { success, failed } = this.enabled(this.getConfig(), recognizer, {
          ...inputData,
          deltaRotation,
        });

        if (failed) {
          // Simulate cancel event
          if (this.isDiscrete) {
            // Long press never starts so we can't rely on the running event boolean.
            if (this.name === 'press') {
              this._cancelEvent(inputData);
            } else if (this.isGestureRunning) {
              this._cancelEvent(inputData);
            }
          }
          this.hasGestureFailed = true;
        }
        return success;
      },
    });
  };
}

class IndiscreteGestureHandler extends GestureHandler {
  update({ minPointers = 2, maxPointers = 2, ...props }) {
    return super.update({
      minPointers,
      maxPointers,
      ...props,
    });
  }

  get shouldEnableGestureOnSetup() {
    return false;
  }

  enabled(
    { minPointers, maxPointers },
    recognizer,
    { maxPointers: pointerLength, deltaX: dx, deltaY: dy }
  ) {
    if (pointerLength > maxPointers) {
      return { failed: true };
    }
    const validPointerCount = pointerLength >= minPointers;
    return {
      success: validPointerCount,
    };
  }
}

class RotationGestureHandler extends IndiscreteGestureHandler {
  get name() {
    return 'rotate';
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

class PinchGestureHandler extends IndiscreteGestureHandler {
  get name() {
    return 'pinch';
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

const isnan = v => Number.isNaN(v);
const TEST_MIN_IF_NOT_NAN = (value, limit) =>
  !isnan(limit) && ((limit < 0 && value <= limit) || (limit >= 0 && value >= limit));
const VEC_LEN_SQ = ({ x = 0, y = 0 } = {}) => x * x + y * y;
const TEST_MAX_IF_NOT_NAN = (value, max) =>
  !isnan(max) && ((max < 0 && value < max) || (max >= 0 && value > max));
class PanGestureHandler extends GestureHandler {
  get name() {
    return 'pan';
  }

  get shouldEnableGestureOnSetup() {
    return true;
  }

  _getHammerConfig() {
    console.log('dirrr', dirrs[this.getDirection()]);
    return {
      ...super._getHammerConfig(),
      direction: this.getDirection(),
    };
  }

  getDirection() {
    const config = this.getConfig();
    const {
      activeOffsetXStart,
      activeOffsetXEnd,
      activeOffsetYStart,
      activeOffsetYEnd,
      minDist,
    } = config;
    let directions = [];
    let horizontalDirections = [];

    console.log('panDirectionForConfig', config);
    // sigh
    if (!isnan(minDist)) {
      return Hammer.DIRECTION_ALL;
    }

    if (!isnan(activeOffsetXStart)) horizontalDirections.push(Hammer.DIRECTION_LEFT);
    if (!isnan(activeOffsetXEnd)) horizontalDirections.push(Hammer.DIRECTION_RIGHT);
    if (horizontalDirections.length === 2) horizontalDirections = [Hammer.DIRECTION_HORIZONTAL];

    directions = directions.concat(horizontalDirections);
    let verticalDirections = [];

    if (!isnan(activeOffsetYStart)) verticalDirections.push(Hammer.DIRECTION_UP);
    if (!isnan(activeOffsetYEnd)) verticalDirections.push(Hammer.DIRECTION_DOWN);

    if (verticalDirections.length === 2) verticalDirections = [Hammer.DIRECTION_VERTICAL];

    directions = directions.concat(verticalDirections);

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

  getConfig() {
    if (!this._hasCustomActivationCriteria) {
      // Default config
      // If no params have been defined then this config should emulate the native gesture as closely as possible.
      return {
        minDistSq: 10,
      };
    }
    return this.config;
  }

  shouldFailUnderCustomCriteria(
    { x, y },
    { failOffsetXStart, failOffsetXEnd, failOffsetYStart, failOffsetYEnd }
  ) {
    return (
      (!isnan(failOffsetXStart) && x < failOffsetXStart) ||
      (!isnan(failOffsetXEnd) && x > failOffsetXEnd) ||
      (!isnan(failOffsetYStart) && y < failOffsetYStart) ||
      (!isnan(failOffsetYEnd) && y > failOffsetYEnd)
    );
  }

  shouldActivateUnderCustomCriteria(
    { x, y, velocity },
    {
      activeOffsetXStart,
      activeOffsetXEnd,
      activeOffsetYStart,
      activeOffsetYEnd,
      minDistSq,
      minVelocityX,
      minVelocityY,
      minVelocitySq,
    }
  ) {
    if (!isnan(activeOffsetXStart) && x < activeOffsetXStart) {
      return true;
    }
    if (!isnan(activeOffsetXEnd) && x > activeOffsetXEnd) {
      return true;
    }
    if (!isnan(activeOffsetYStart) && y < activeOffsetYStart) {
      return true;
    }
    if (!isnan(activeOffsetYEnd) && y > activeOffsetYEnd) {
      return true;
    }

    if (TEST_MIN_IF_NOT_NAN(VEC_LEN_SQ({ x, y }), minDistSq)) {
      return true;
    }

    if (TEST_MIN_IF_NOT_NAN(velocity.x, minVelocityX)) {
      return true;
    }
    if (TEST_MIN_IF_NOT_NAN(velocity.y, minVelocityY)) {
      return true;
    }
    if (TEST_MIN_IF_NOT_NAN(VEC_LEN_SQ(velocity), minVelocitySq)) {
      return true;
    }

    return false;
  }

  _shouldMultiFingerPanFail({ pointerLength, scale, deltaRotation }) {
    if (pointerLength <= 1) {
      return false;
    }

    // Test if the pan had too much pinching or rotating.
    const deltaScale = Math.abs(scale - 1);
    const absDeltaRotation = Math.abs(deltaRotation);
    if (deltaScale > MULTI_FINGER_PAN_MAX_PINCH_THRESHOLD) {
      // > If the threshold doesn't seem right.
      // You can log the value which it failed at here:
      // console.log('Pan failed: scale: ', deltaScale);
      return true;
    }
    if (absDeltaRotation > MULTI_FINGER_PAN_MAX_ROTATION_THRESHOLD) {
      // > If the threshold doesn't seem right.
      // You can log the value which it failed at here:
      // console.log('Pan failed: rotate: ', absDeltaRotation);
      return true;
    }

    return false;
  }

  updateHasCustomActivationCriteria({
    minDistSq,
    minVelocityX,
    activeOffsetXStart,
    activeOffsetYStart,
    minVelocityY,
    activeOffsetXEnd,
    activeOffsetYEnd,
    minVelocitySq,
  }) {
    // console.log('updateHasCustomActivationCriteria', {
    //   minDistSq,
    //   minVelocityX,
    //   activeOffsetXStart,
    //   activeOffsetYStart,
    //   minVelocityY,
    //   activeOffsetXEnd,
    //   activeOffsetYEnd,
    //   minVelocitySq,
    // });
    return (
      !isnan(minDistSq) ||
      !isnan(minVelocityX) ||
      !isnan(minVelocityY) ||
      !isnan(minVelocitySq) ||
      !isnan(activeOffsetXStart) ||
      !isnan(activeOffsetXEnd) ||
      !isnan(activeOffsetYStart) ||
      !isnan(activeOffsetYEnd)
    );
  }

  update({
    minVelocity = Number.NaN,
    minVelocityX = Number.NaN,
    minVelocityY = Number.NaN,
    minPointers = Number.NaN,
    maxPointers = Number.NaN,
    minDist = Number.NaN,
    activeOffsetXStart = Number.NaN,
    activeOffsetXEnd = Number.NaN,
    failOffsetXStart = Number.NaN,
    failOffsetXEnd = Number.NaN,
    activeOffsetYStart = Number.NaN,
    activeOffsetYEnd = Number.NaN,
    failOffsetYStart = Number.NaN,
    failOffsetYEnd = Number.NaN,

    ...props
  }) {
    // this.validateConfig(this.config)
    return super.update({
      minVelocity,
      minVelocityX,
      minVelocityY,
      minPointers,
      maxPointers,
      minDist,
      activeOffsetXStart,
      activeOffsetXEnd,
      failOffsetXStart,
      failOffsetXEnd,
      activeOffsetYStart,
      activeOffsetYEnd,
      failOffsetYStart,
      failOffsetYEnd,

      ...props,
    });
  }

  validateConfig(config = {}) {
    const isNum = v => isnan(v) || typeof v === 'number';
    const isBool = v => typeof v === 'boolean';

    const valid = {
      enabled: isBool,
      minDistSq: isNum,
      minVelocityX: isNum,
      minVelocityY: isNum,
      // TODO: Bacon: remove `minVelocity`
      minVelocity: isNum,
      minVelocitySq: isNum,
      activeOffsetXStart: isNum,
      activeOffsetXEnd: isNum,
      failOffsetXStart: isNum,
      failOffsetXEnd: isNum,
      activeOffsetYStart: isNum,
      activeOffsetYEnd: isNum,
      failOffsetYStart: isNum,
      failOffsetYEnd: isNum,
      hasCustomActivationCriteria: isBool,
      minPointers: isNum,
      maxPointers: isNum,
    };
    const keys = Object.keys(valid);

    let invalidKeys = [];
    for (const key of Object.keys(config)) {
      if (keys.includes(key)) {
        if (valid[key](config[key])) {
          console.warn('Invalid type: ' + key + ': ' + config[key]);
        }
      } else {
        invalidKeys.push(key);
      }
    }

    if (invalidKeys.length) {
      throw new Error('Invalid config props found: ' + invalidKeys.join(', '));
    }
    return config;
  }

  enabled(props, recognizer, inputData) {
    const translation = { x: inputData.deltaX, y: inputData.deltaY };
    if (this.shouldFailUnderCustomCriteria(translation, props)) {
      return { failed: true };
    }

    const velocity = { x: inputData.velocityX, y: inputData.velocityY };
    if (
      this._hasCustomActivationCriteria &&
      this.shouldActivateUnderCustomCriteria({ ...translation, velocity }, props)
    ) {
      if (
        this._shouldMultiFingerPanFail({
          pointerLength: inputData.maxPointers,
          scale: inputData.scale,
          deltaRotation: inputData.deltaRotation,
        })
      ) {
        return {
          failed: true,
        };
      }
      return { success: true };
    }

    return { success: false };
    // return validateCriteria(
    //   {
    //     ...inputData,
    //     recognizer,
    //     pointerLength: inputData.maxPointers,
    //     velocity: inputData.overallVelocity,
    //     vx: inputData.velocityX,
    //     vy: inputData.velocityY,
    //     dx: inputData.deltaX,
    //     dy: inputData.deltaY,
    //   },
    //   props
    // );
  }

  // The event object that is returned
  filter({ translationX, translationY, velocityX, velocityY, x, y, absoluteX, absoluteY }) {
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

class DiscreteGestureHandler extends GestureHandler {
  get isDiscrete() {
    return true;
  }
  get shouldEnableGestureOnSetup() {
    return true;
  }

  shouldFailUnderCustomCriteria({ x, y }, { maxDeltaX, maxDeltaY, maxDistSq }) {
    // TODO: Bacon:
    // if (_gestureHandler.shouldCancelWhenOutside) {
    //   if (![_gestureHandler containsPointInView]) {
    //     return YES;
    //   }
    // }
    return (
      TEST_MAX_IF_NOT_NAN(Math.abs(x), maxDeltaX) ||
      TEST_MAX_IF_NOT_NAN(Math.abs(y), maxDeltaY) ||
      TEST_MAX_IF_NOT_NAN(Math.abs(y * y + x + x), maxDistSq)
    );
  }

  filter({ x, y, absoluteX, absoluteY }) {
    return {
      x,
      y,
      absoluteX,
      absoluteY,
    };
  }

  enabled(
    { minPointers, maxPointers, maxDist, maxDeltaX, maxDeltaY, maxDistSq },
    recognizer,
    { maxPointers: pointerLength, deltaX: dx, deltaY: dy }
  ) {
    const translation = { x: dx, y: dy };
    if (
      this.shouldFailUnderCustomCriteria(translation, {
        maxDeltaX,
        maxDeltaY,
        maxDistSq,
      })
    ) {
      return { failed: true };
    }

    const validPointerCount = pointerLength >= minPointers && pointerLength <= maxPointers;

    console.log('Tap.enable:', dx, dy, maxDistSq, validPointerCount, pointerLength, minPointers, maxPointers);
    // A user probably won't land a multi-pointer tap on the first tick (so we cannot just cancel each time)
    // but if the gesture is running and the user adds or subtracts another pointer then it should fail.
    if (!validPointerCount && this.isGestureRunning) {
      return { failed: true };
    }
    return { success: validPointerCount };
    // return { failed: true };
  }
}

class TapGestureHandler extends DiscreteGestureHandler {
  get name() {
    return 'tap';
  }

  onMainEvent(ev) {
    if (this.isGestureRunning) {
      this._onSuccessfulTap(ev);
    } else {
      console.log('tap.prevent multi');
    }
  }

  _onSuccessfulTap = (ev) => {
    console.log('_onSuccessfulTap', this.config.numberOfTaps, this._getPendingGestures().length)
    if (this._getPendingGestures().length) {
      this._shouldFireEndEvent = ev;
      return;
    }
    if (ev.eventType === Hammer.INPUT_END) {
      this._sendEvent({ ...ev, eventType: Hammer.INPUT_MOVE });
    }
    // When handler gets activated it will turn into State.END immediately.
    this._sendEvent({ ...ev, isFinal: true });
    this._onEnd(ev);
  };

  get maxDelayMs() {
    return isnan(this.config.maxDelayMs) ? 300 : this.config.maxDelayMs;
  }

  onRawEvent(ev) {
    super.onRawEvent(ev);
    // Hammer doesn't send a `cancel` event for taps. 
    // Manually fail the event.
    if (ev.isFinal) {

      // Handle case where one finger presses slightly
      // after the first finger on a multi-tap event
      if (ev.maxPointers > 1) {
        setTimeout(() => {
          if (this.isGestureRunning) {
            this._cancelEvent(ev);
          }
        });
      }

      // Clear last timer
      clearTimeout(this._timer);
      // Create time out for multi-taps.
      this._timer = setTimeout(() => {
        this.hasGestureFailed = true;
        this._cancelEvent(ev);
      }, this.maxDelayMs);

    } else if (
      !this.hasGestureFailed &&
      !this.isGestureRunning) {
        // Tap Gesture start event
        const gesture = this.hammer.get(this.name);
        if (gesture.options.enable(gesture, ev)) {
          console.log(`${this.name}.start`);
          clearTimeout(this._multiTapTimer);

          this.onStart(ev);
          this._sendEvent(ev);
        }
    }
  }

  _getHammerConfig() {
    return {
      ...super._getHammerConfig(),
      taps: isnan(this.config.numberOfTaps) ? 1 : this.config.numberOfTaps,
      interval: this.maxDelayMs,
      time:
        isnan(this.config.maxDurationMs) || this.config.maxDurationMs == null
          ? 250
          : this.config.maxDurationMs,
    };
  }

  update({
    maxDeltaX = Number.NaN,
    maxDeltaY = Number.NaN,
    numberOfTaps = 1,
    minDurationMs = 525,
    maxDelayMs = Number.NaN,
    maxDurationMs = Number.NaN,
    maxDist = 2,
    minPointers = 1,
    maxPointers = 1,
    ...props
  }) {
    console.log('update', {
      // time,
      // taps,
      // interval,
      maxDist,
      minPointers,
      maxPointers,
      ...props,
    });

    return super.update({
      numberOfTaps,
      maxDeltaX,
      maxDeltaY,
      minDurationMs,
      maxDelayMs,
      maxDist,
      minPointers,
      maxPointers,
      ...props,
    });
  }

  _onEnd(...props) {  
    clearTimeout(this._timer);
    super._onEnd(...props);
  }

  onWaitingEnded(gesture) {
    if (this._shouldFireEndEvent) {
      this._onSuccessfulTap(this._shouldFireEndEvent);
      this._shouldFireEndEvent = null;
    }
  }

  start({ manager, props }) {
    manager.add(
      new Hammer.Tap({
        taps: props.numberOfTaps,
        event: this.name,
        pointers: props.minPointers,
      })
    );
  }
}

class LongPressGestureHandler extends DiscreteGestureHandler {
  get name() {
    return 'press';
  }

  get minDurationMs() {
    return isnan(this.config.minDurationMs) ? 251 : this.config.minDurationMs;
  }

  get maxDist() {
    return isnan(this.config.maxDist) ? 9 : this.config.maxDist;
  }


  updateHasCustomActivationCriteria({ maxDistSq }) {
    return (!isnan(maxDistSq));
  }

  getConfig() {
    if (!this._hasCustomActivationCriteria) {
      // Default config
      // If no params have been defined then this config should emulate the native gesture as closely as possible.
      return {
        maxDistSq: 10,
      };
    }
    return this.config;
  }
  
  _getHammerConfig() {
    return {
      ...super._getHammerConfig(),
      // threshold: this.maxDist,
      time: this.minDurationMs,
    };
  }

  onMainEvent(ev) {
    this.isGestureRunning = true;
    this._sendEvent({
      ...ev,
      eventType: Hammer.INPUT_MOVE,
      isFirst: true,
    });
    // When handler gets activated it will turn into State.END immediately.
    this._sendEvent({
      ...ev,
      eventType: Hammer.INPUT_END,
      isFinal: true,
    });
    this._onEnd();
  }

  getState(type) {
    return {
      [Hammer.INPUT_START]: State.ACTIVE,
      [Hammer.INPUT_MOVE]: State.ACTIVE,
      [Hammer.INPUT_END]: State.END,
      [Hammer.INPUT_CANCEL]: State.FAILED,
    }[type];
  }

  update({ minDurationMs = Number.NaN, maxDist = Number.NaN, minPointers = 1, maxPointers = 1, ...props }) {
    return super.update({
      minDurationMs,
      maxDist,
      minPointers,
      maxPointers,
      ...props,
    });
  }

  start({ manager, props }) {
    manager.add(new Hammer.Press({ pointers: props.minPointers }));
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
  getGestureHandlerNode(handlerTag) {
    return getHandler(handlerTag);
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
