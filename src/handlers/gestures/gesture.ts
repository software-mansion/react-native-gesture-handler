import { BaseGesture } from './baseGesture';
import { FlingGesture } from './flingGesture';
import { ForceTouchGesture } from './forceTouchGesture';
import { LongPressGesture } from './longPressGesture';
import { PanGesture } from './panGesture';
import { PinchGesture } from './pinchGesture';
import { RotationGesture } from './rotationGesture';
import { TapGesture } from './tapGesture';

export abstract class Gesture {
  /**
   * Return array of gestures, providing the same interface for creating and updating
   * handlers, no matter which object was used to create gesture instance.
   */
  abstract configure(): BaseGesture<any>[];

  /**
   * Assign handlerTag to the gesture instance and set ref.current (if a ref is set)
   */
  abstract initialize(): void;

  /**
   * Make sure that values of properties defining relations are arrays. Do any necessary
   * preprocessing required to configure relations between handlers. Called just before
   * updating the handler on the native side.
   */
  abstract prepare(): void;

  static tap() {
    return new TapGesture();
  }

  static pan() {
    return new PanGesture();
  }

  static pinch() {
    return new PinchGesture();
  }

  static rotation() {
    return new RotationGesture();
  }

  static fling() {
    return new FlingGesture();
  }

  static longPress() {
    return new LongPressGesture();
  }

  static forceTouch() {
    return new ForceTouchGesture();
  }
}
