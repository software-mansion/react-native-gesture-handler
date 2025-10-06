import type { FlingGestureEvent, FlingGesture } from './useFling';
import type { HoverGestureEvent, HoverGesture } from './useHover';
import type { LongPressGestureEvent, LongPressGesture } from './useLongPress';
import type { ManualGestureEvent, ManualGesture } from './useManual';
import type { NativeGestureEvent, NativeGesture } from './useNative';
import type { PanGestureEvent, PanGesture } from './usePan';
import type { PinchGestureEvent, PinchGesture } from './usePinch';
import type { RotationGestureEvent, RotationGesture } from './useRotation';
import type { TapGestureEvent, TapGesture } from './useTap';

export type { TapGestureConfig } from './useTap';
export type { TapGesture, TapGestureEvent };
export { useTap } from './useTap';

export type { FlingGestureConfig } from './useFling';
export type { FlingGesture, FlingGestureEvent };
export { useFling } from './useFling';

export type { LongPressGestureConfig } from './useLongPress';
export type { LongPressGesture, LongPressGestureEvent };
export { useLongPress } from './useLongPress';

export type { PinchGestureConfig } from './usePinch';
export type { PinchGesture, PinchGestureEvent };
export { usePinch } from './usePinch';

export type { RotationGestureConfig } from './useRotation';
export type { RotationGesture, RotationGestureEvent };
export { useRotation } from './useRotation';

export type { HoverGestureConfig } from './useHover';
export type { HoverGesture, HoverGestureEvent };
export { useHover } from './useHover';

export type { ManualGestureConfig } from './useManual';
export type { ManualGesture, ManualGestureEvent };
export { useManual } from './useManual';

export type { NativeViewGestureConfig } from './useNative';
export type { NativeGesture, NativeGestureEvent };
export { useNative } from './useNative';

export type { PanGestureConfig } from './usePan';
export type { PanGesture, PanGestureEvent };
export { usePan } from './usePan';

export type SingleGesture =
  | TapGesture
  | FlingGesture
  | LongPressGesture
  | PinchGesture
  | RotationGesture
  | HoverGesture
  | ManualGesture
  | NativeGesture
  | PanGesture;

export type SingleGestureEvent =
  | TapGestureEvent
  | FlingGestureEvent
  | LongPressGestureEvent
  | PinchGestureEvent
  | RotationGestureEvent
  | HoverGestureEvent
  | ManualGestureEvent
  | NativeGestureEvent
  | PanGestureEvent;
