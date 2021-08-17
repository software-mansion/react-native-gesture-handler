import { GestureConfig } from './gestureBuilder';
import {
  Tap,
  Pan,
  Pinch,
  Rotation,
  Fling,
  LongPress,
  ForceTouch,
} from './simpleGestures';

export abstract class Gesture {
  /**
   * Return GestureConfig, providing the same interface for creating and updating
   * handlers, no matter which object was used to create gesture instance.
   */
  abstract configure(): GestureConfig;

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
    return new Tap();
  }

  static pan() {
    return new Pan();
  }

  static pinch() {
    return new Pinch();
  }

  static rotation() {
    return new Rotation();
  }

  static fling() {
    return new Fling();
  }

  static longPress() {
    return new LongPress();
  }

  static forceTouch() {
    return new ForceTouch();
  }
}
