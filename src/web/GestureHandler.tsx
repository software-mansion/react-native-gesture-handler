import Hammer from '@egjs/hammerjs';
import { findNodeHandle } from 'react-native';

import State from '../State';
import { EventMap } from './constants';
import * as NodeManager from './NodeManager';

import { GestureHandlerProperties } from '../types';

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

  private _gestureInstance: any;
  name: any;
  _hasCustomActivationCriteria: boolean;
  handlerTag: any;
  ref: any;
  propsRef: any;
  initialRotation: null;
  __initialX: any;
  __initialY: any;
  _stillWaiting: any;

  get id() {
    return `${this.name}${this._gestureInstance}`;
  }
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
                if (value?.setValue) {
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

function asArray(value: any) {
  return value == null ? [] : Array.isArray(value) ? value : [value];
}

export default GestureHandler;
