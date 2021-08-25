import { FlingGesture } from './flingGesture';
import { ForceTouchGesture } from './forceTouchGesture';
import { Gesture } from './gesture';
import {
  ComposedGesture,
  RequireToFailGesture,
  SimultaneousGesture,
} from './gestureInteractions';
import { LongPressGesture } from './longPressGesture';
import { PanGesture } from './panGesture';
import { PinchGesture } from './pinchGesture';
import { RotationGesture } from './rotationGesture';
import { TapGesture } from './tapGesture';

export const GestureObjects = {
  tap() {
    return new TapGesture();
  },

  pan() {
    return new PanGesture();
  },

  pinch() {
    return new PinchGesture();
  },

  rotation() {
    return new RotationGesture();
  },

  fling() {
    return new FlingGesture();
  },

  longPress() {
    return new LongPressGesture();
  },

  forceTouch() {
    return new ForceTouchGesture();
  },

  exclusive(...gestures: Gesture[]) {
    return new ComposedGesture(...gestures);
  },

  simultaneous(first: Gesture, second: Gesture) {
    return new SimultaneousGesture(first, second);
  },

  requireToFail(first: Gesture, second: Gesture) {
    return new RequireToFailGesture(first, second);
  },
};
