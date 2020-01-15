import Hammer from '@egjs/hammerjs';
import { findNodeHandle } from 'react-native';

import State from '../State';
import { EventMap } from './constants';
import * as NodeManager from './NodeManager';

let _gestureInstances = 0;

class GestureHandler {
  isGestureRunning = false;
  hasGestureFailed = false;
  view = null;
  config = {};
  hammer = null;
  pendingGestures = {};
  oldState = State.UNDETERMINED;
  previousState = State.UNDETERMINED;
  lastSentState = null;

  get id() {
    return `${this.name}${this._gestureInstance}`;
  }

  get isDiscrete() {
    return false;
  }

  get shouldEnableGestureOnSetup() {
    throw new Error('Must override GestureHandler.shouldEnableGestureOnSetup');
  }

  constructor() {
    this._gestureInstance = _gestureInstances++;
  }

  getConfig() {
    return this.config;
  }

  onWaitingEnded(gesture) {}

  removePendingGesture(id) {
    delete this.pendingGestures[id];
  }

  addPendingGesture(gesture) {
    this.pendingGestures[gesture.id] = gesture;
  }

  isGestureEnabledForEvent() {
    return { success: true };
  }

  parseNativeEvent(nativeEvent) {
    return nativeEvent;
  }

  get NativeGestureClass() {
    throw new Error('Must override GestureHandler.NativeGestureClass');
  }

  updateHasCustomActivationCriteria(config) {
    return true;
  }

  clearSelfAsPending = () => {
    if (Array.isArray(this.config.waitFor)) {
      for (const gesture of this.config.waitFor) {
        gesture.removePendingGesture(this.id);
      }
    }
  };

  updateGestureConfig({ enabled = true, ...props }) {
    this.clearSelfAsPending();

    this.config = ensureConfig({ enabled, ...props });
    this._hasCustomActivationCriteria = this.updateHasCustomActivationCriteria(
      this.config
    );
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
    this.clearSelfAsPending();

    if (this.hammer) {
      this.hammer.stop();
      this.hammer.destroy();
    }
    this.hammer = null;
  };

  isPointInView = ({ x, y }) => {
    const rect = this.view.getBoundingClientRect();
    const pointerInside =
      x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
    return pointerInside;
  };

  getState(type) {
    return EventMap[type];
  }

  transformEventData(event) {
    const { eventType, maxPointers: numberOfPointers } = event;
    // const direction = DirectionMap[ev.direction];
    const changedTouch = event.changedPointers[0];
    const pointerInside = this.isPointInView({
      x: changedTouch.clientX,
      y: changedTouch.clientY,
    });

    const state = this.getState(eventType);
    if (state !== this.previousState) {
      this.oldState = this.previousState;
      this.previousState = state;
    }

    return {
      nativeEvent: {
        numberOfPointers,
        state,
        pointerInside,
        ...this.transformNativeEvent(event),
        // onHandlerStateChange only
        handlerTag: this.handlerTag,
        target: this.ref,
        oldState: this.oldState,
      },
      timeStamp: Date.now(),
    };
  }

  transformNativeEvent(event) {
    return {};
  }

  sendEvent = nativeEvent => {
    const {
      onGestureHandlerStateChange: onHandlerStateChange,
      onGestureHandlerEvent: onGestureEvent,
    } = this.ref.props;

    const event = this.transformEventData(nativeEvent);

    invokeNullableMethod('onGestureEvent', onGestureEvent, event);
    if (this.lastSentState !== event.nativeEvent.state) {
      this.lastSentState = event.nativeEvent.state;
      invokeNullableMethod('onHandlerStateChange', onHandlerStateChange, event);
    }
  };

  cancelPendingGestures(event) {
    for (const gesture of Object.values(this.pendingGestures)) {
      if (gesture && gesture.isGestureRunning) {
        gesture.hasGestureFailed = true;
        gesture.cancelEvent(event);
      }
    }
  }

  notifyPendingGestures() {
    for (const gesture of Object.values(this.pendingGestures)) {
      if (gesture) {
        gesture.onWaitingEnded(this);
      }
    }
  }

  onGestureEnded(event) {
    this.isGestureRunning = false;
    this.cancelPendingGestures(event);
  }

  forceInvalidate(event) {
    if (this.isGestureRunning) {
      this.hasGestureFailed = true;
      this.cancelEvent(event);
    }
  }

  cancelEvent(event) {
    this.notifyPendingGestures();
    this.sendEvent({
      ...event,
      eventType: Hammer.INPUT_CANCEL,
      isFinal: true,
    });
    this.onGestureEnded(event);
  }

  onRawEvent({ isFirst }) {
    if (isFirst) {
      this.hasGestureFailed = false;
    }
  }

  setView(ref) {
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
    this.lastSentState = null;

    const { NativeGestureClass } = this;
    const gesture = new NativeGestureClass(this.getHammerConfig());
    this.hammer.add(gesture);

    this.hammer.on('hammer.input', ev => {
      if (!this.config.enabled) {
        this.hasGestureFailed = false;
        this.isGestureRunning = false;
        return;
      }

      this.onRawEvent(ev);

      // TODO: Bacon: Check against something other than null
      // The isFirst value is not called when the first rotation is calculated.
      if (this.initialRotation === null && ev.rotation !== 0) {
        this.initialRotation = ev.rotation;
      }
      if (ev.isFinal) {
        // in favor of a willFail otherwise the last frame of the gesture will be captured.
        setTimeout(() => {
          this.initialRotation = null;
          this.hasGestureFailed = false;
        });
      }
    });

    this.setupEvents();
    this.sync();
  }

  setupEvents() {
    if (!this.isDiscrete) {
      this.hammer.on(`${this.name}start`, event => this.onStart(event));
      this.hammer.on(`${this.name}end ${this.name}cancel`, event =>
        this.onGestureEnded(event)
      );
    }
    this.hammer.on(this.name, ev => this.onGestureActivated(ev));
  }

  onStart({ deltaX, deltaY, rotation }) {
    // Reset the state for the next gesture
    this.oldState = State.UNDETERMINED;
    this.previousState = State.UNDETERMINED;
    this.lastSentState = null;

    this.isGestureRunning = true;
    this.__initialX = deltaX;
    this.__initialY = deltaY;
    this.initialRotation = rotation;
  }

  onGestureActivated(ev) {
    this.sendEvent(ev);
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

  getHammerConfig() {
    const pointers =
      this.config.minPointers === this.config.maxPointers
        ? this.config.minPointers
        : 0;
    return {
      pointers,
    };
  }

  sync = () => {
    const gesture = this.hammer.get(this.name);
    if (!gesture) return;

    const enable = (recognizer, inputData) => {
      if (!this.config.enabled) {
        this.isGestureRunning = false;
        this.hasGestureFailed = false;
        return false;
      }

      // Prevent events before the system is ready.
      if (
        !inputData ||
        !recognizer.options ||
        typeof inputData.maxPointers === 'undefined'
      ) {
        return this.shouldEnableGestureOnSetup;
      }

      if (this.hasGestureFailed) {
        return false;
      }

      if (!this.isDiscrete) {
        if (this.isGestureRunning) {
          return true;
        }
        // The built-in hammer.js "waitFor" doesn't work across multiple views.
        // Only process if there are views to wait for.
        this._stillWaiting = this._getPendingGestures();
        // This gesture should continue waiting.
        if (this._stillWaiting.length) {
          // Check to see if one of the gestures you're waiting for has started.
          // If it has then the gesture should fail.
          for (const gesture of this._stillWaiting) {
            // When the target gesture has started, this gesture must force fail.
            if (!gesture.isDiscrete && gesture.isGestureRunning) {
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
        this.initialRotation == null
          ? 0
          : inputData.rotation - this.initialRotation;
      const { success, failed } = this.isGestureEnabledForEvent(
        this.getConfig(),
        recognizer,
        {
          ...inputData,
          deltaRotation,
        }
      );

      if (failed) {
        this.simulateCancelEvent(inputData);
        this.hasGestureFailed = true;
      }
      return success;
    };

    const params = this.getHammerConfig();
    gesture.set({ ...params, enable });
  };

  simulateCancelEvent(inputData) {}
}

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
              const [key, value] = argMapping[index];
              if (key in event.nativeEvent) {
                const nativeValue = event.nativeEvent[key];
                if (value && value.setValue) {
                  // Reanimated API
                  value.setValue(nativeValue);
                } else {
                  // RN Animated API
                  method.__nodeConfig.argMapping[index] = [key, nativeValue];
                }
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
  if ('waitFor' in config) {
    props.waitFor = asArray(config.waitFor)
      .map(({ _handlerTag }) => NodeManager.getHandler(_handlerTag))
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
    if (typeof props[prop] === 'undefined') {
      props[prop] = Number.NaN;
    }
  });
  return props;
}

function asArray(value) {
  return value == null ? [] : Array.isArray(value) ? value : [value];
}

export default GestureHandler;
