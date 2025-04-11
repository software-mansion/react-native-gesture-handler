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
import { NativeGesture } from './nativeGesture';
import { ManualGesture } from './manualGesture';
import { HoverGesture } from './hoverGesture';

/**
 * `Gesture` is the object that allows you to create and compose gestures.
 *
 * ### Remarks
 * - Consider wrapping your gesture configurations with `useMemo`, as it will reduce the amount of work Gesture Handler has to do under the hood when updating gestures.
 *
 * @see https://docs.swmansion.com/react-native-gesture-handler/docs/gestures/gesture
 */
export const GestureObjects = {
  /**
   * A discrete gesture that recognizes one or many taps.
   * @see https://docs.swmansion.com/react-native-gesture-handler/docs/gestures/tap-gesture
   */
  Tap: () => {
    return new TapGesture();
  },

  /**
   * A continuous gesture that can recognize a panning (dragging) gesture and track its movement.
   * @see https://docs.swmansion.com/react-native-gesture-handler/docs/gestures/pan-gesture
   */
  Pan: () => {
    return new PanGesture();
  },

  /**
   * A continuous gesture that recognizes pinch gesture. It allows for tracking the distance between two fingers and use that information to scale or zoom your content.
   * @see https://docs.swmansion.com/react-native-gesture-handler/docs/gestures/pinch-gesture
   */
  Pinch: () => {
    return new PinchGesture();
  },

  /**
   * A continuous gesture that can recognize rotation and track its movement.
   * @see https://docs.swmansion.com/react-native-gesture-handler/docs/gestures/rotation-gesture
   */
  Rotation: () => {
    return new RotationGesture();
  },

  /**
   * A discrete gesture that activates when the movement is sufficiently fast.
   * @see https://docs.swmansion.com/react-native-gesture-handler/docs/gestures/fling-gesture
   */
  Fling: () => {
    return new FlingGesture();
  },

  /**
   * A discrete gesture that activates when the corresponding view is pressed for a sufficiently long time.
   * @see https://docs.swmansion.com/react-native-gesture-handler/docs/gestures/long-press-gesture
   */
  LongPress: () => {
    return new LongPressGesture();
  },

  /**
   * #### iOS only
   * A continuous gesture that recognizes force of a touch. It allows for tracking pressure of touch on some iOS devices.
   * @see https://docs.swmansion.com/react-native-gesture-handler/docs/gestures/force-touch-gesture
   */
  ForceTouch: () => {
    return new ForceTouchGesture();
  },

  /**
   * A gesture that allows other touch handling components to participate in RNGH's gesture system.
   * When used, the other component should be the direct child of a `GestureDetector`.
   * @see https://docs.swmansion.com/react-native-gesture-handler/docs/gestures/native-gesture
   */
  Native: () => {
    return new NativeGesture();
  },

  /**
   * A plain gesture that has no specific activation criteria nor event data set.
   * Its state has to be controlled manually using a state manager.
   * It will not fail when all the pointers are lifted from the screen.
   * @see https://docs.swmansion.com/react-native-gesture-handler/docs/gestures/manual-gesture
   */
  Manual: () => {
    return new ManualGesture();
  },

  /**
   * A continuous gesture that can recognize hovering above the view it's attached to.
   * The hover effect may be activated by moving a mouse or a stylus over the view.
   *
   * @see https://docs.swmansion.com/react-native-gesture-handler/docs/gestures/hover-gesture
   */
  Hover: () => {
    return new HoverGesture();
  },

  /**
   * Builds a composed gesture consisting of gestures provided as parameters.
   * The first one that becomes active cancels the rest of gestures.
   * @see https://docs.swmansion.com/react-native-gesture-handler/docs/fundamentals/gesture-composition/#race
   */
  Race: (...gestures: Gesture[]) => {
    return new ComposedGesture(...gestures);
  },

  /**
   * Builds a composed gesture that allows all base gestures to run simultaneously.
   * @see https://docs.swmansion.com/react-native-gesture-handler/docs/fundamentals/gesture-composition/#simultaneous
   */
  Simultaneous(...gestures: Gesture[]) {
    return new SimultaneousGesture(...gestures);
  },

  /**
   * Builds a composed gesture where only one of the provided gestures can become active.
   * Priority is decided through the order of gestures: the first one has higher priority
   * than the second one, second one has higher priority than the third one, and so on.
   * For example, to make a gesture that recognizes both single and double tap you need
   * to call Exclusive(doubleTap, singleTap).
   * @see https://docs.swmansion.com/react-native-gesture-handler/docs/fundamentals/gesture-composition/#exclusive
   */
  Exclusive(...gestures: Gesture[]) {
    return new ExclusiveGesture(...gestures);
  },
};
