import type { FlingGesture } from './fling/FlingTypes';
import type { HoverGesture } from './hover/HoverTypes';
import type { LongPressGesture } from './longPress/LongPressTypes';
import type { ManualGesture } from './manual/ManualTypes';
import type { NativeGesture } from './native/NativeTypes';
import type { PanGesture } from './pan/PanTypes';
import type { PinchGesture } from './pinch/PinchTypes';
import type { RotationGesture } from './rotation/RotationTypes';
import type { TapGesture } from './tap/TapTypes';

export type AnySingleGesture =
  | TapGesture
  | FlingGesture
  | LongPressGesture
  | PinchGesture
  | RotationGesture
  | HoverGesture
  | ManualGesture
  | NativeGesture
  | PanGesture;
