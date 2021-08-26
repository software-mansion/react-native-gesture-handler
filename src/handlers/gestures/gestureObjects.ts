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

  /**
   * Builds a composed gesture consisting of gestures provided as parameters.
   * Only one of them can become active at the same time, the rest will be cancelled.
   */
  exclusive(...gestures: Gesture[]) {
    return new ComposedGesture(...gestures);
  },

  /**
   * Builds a composed gesture that allows its two base gestures to run simultaneously.
   * @param first A gesture to run simultaneously with the second one
   * @param second A gesture to run simultaneously with the first one
   * @returns ComposedGesture consisting of the gestures provided as parameters.
   */
  simultaneous(first: Gesture, second: Gesture) {
    return new SimultaneousGesture(first, second);
  },

  /**
   * Builds a composed gesture that makes the first gesture wait with activation until
   * the second one fails.
   * For example, to make a gesture that recognizes both single and double tap you need
   * to call requireToFail(singleTap, doubleTap).
   * @param first A gesture that requires the second one to fail in order to activate
   * @param second A gesture that is required to fail by the first one to activate.
   * @returns ComposedGesture consisting of the gestures provided as parameters.
   */
  requireToFail(first: Gesture, second: Gesture) {
    return new RequireToFailGesture(first, second);
  },
};
