import { FlingGesture } from './flingGesture';
import { ForceTouchGesture } from './forceTouchGesture';
import { Gesture } from './gesture';
import {
  ComposedGesture,
  ExclusiveGesture,
  SimultaneousGesture,
} from './gestureComposition';
import { LongPressGesture } from './longPressGesture';
import { PanGesture } from './panGesture';
import { PinchGesture } from './pinchGesture';
import { RotationGesture } from './rotationGesture';
import { TapGesture } from './tapGesture';

export const GestureObjects = {
  Tap() {
    return new TapGesture();
  },

  Pan() {
    return new PanGesture();
  },

  Pinch() {
    return new PinchGesture();
  },

  Rotation() {
    return new RotationGesture();
  },

  Fling() {
    return new FlingGesture();
  },

  LongPress() {
    return new LongPressGesture();
  },

  ForceTouch() {
    return new ForceTouchGesture();
  },

  /**
   * Builds a composed gesture consisting of gestures provided as parameters.
   * The first one that becomes active cancels the rest of gestures.
   */
  Race(...gestures: Gesture[]) {
    return new ComposedGesture(...gestures);
  },

  /**
   * Builds a composed gesture that allows its two base gestures to run simultaneously.
   * @param first A gesture to run simultaneously with the second one
   * @param second A gesture to run simultaneously with the first one
   * @returns ComposedGesture consisting of the gestures provided as parameters.
   */
  Simultaneous(first: Gesture, second: Gesture) {
    return new SimultaneousGesture(first, second);
  },

  /**
   * Builds a composed gesture where only one of the provided gestures can become active.
   * Priority is decided through the order of gestures: the first one has higher priority
   * than the second one.
   * For example, to make a gesture that recognizes both single and double tap you need
   * to call Exclusive(doubleTap, singleTap).
   * @param first A gesture with higher priority
   * @param second A gesture with lower priority
   * @returns ComposedGesture consisting of the gestures provided as parameters.
   */
  Exclusive(first: Gesture, second: Gesture) {
    return new ExclusiveGesture(first, second);
  },
};
