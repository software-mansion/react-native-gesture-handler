import { FlingGesture } from './flingGesture';
import { ForceTouchGesture } from './forceTouchGesture';
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
};
