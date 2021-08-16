import { BuiltGesture } from './gestureBuilder';
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
  _requireToFail = [];
  _after = [];
  _simultaneousWith = [];

  abstract build(): BuiltGesture;

  abstract initialize(): void;

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
