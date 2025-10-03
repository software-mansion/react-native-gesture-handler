import { FlingGestureEvent, FlingGestureType } from './useFling';
import { HoverGestureEvent, HoverGestureType } from './useHover';
import { LongPressGestureEvent, LongPressGestureType } from './useLongPress';
import { ManualGestureEvent, ManualGestureType } from './useManual';
import { NativeGestureEvent, NativeGestureType } from './useNative';
import { PanGestureEvent, PanGestureType } from './usePan';
import { PinchGestureEvent, PinchGestureType } from './usePinch';
import { RotationGestureEvent, RotationGestureType } from './useRotation';
import { TapGestureEvent, TapGestureType } from './useTap';

export type { TapGestureConfig } from './useTap';
export type { TapGestureType, TapGestureEvent };
export { useTap } from './useTap';

export type { FlingGestureConfig } from './useFling';
export type { FlingGestureType, FlingGestureEvent };
export { useFling } from './useFling';

export type { LongPressGestureConfig } from './useLongPress';
export type { LongPressGestureType, LongPressGestureEvent };
export { useLongPress } from './useLongPress';

export type { PinchGestureConfig } from './usePinch';
export type { PinchGestureType, PinchGestureEvent };
export { usePinch } from './usePinch';

export type { RotationGestureConfig } from './useRotation';
export type { RotationGestureType, RotationGestureEvent };
export { useRotation } from './useRotation';

export type { HoverGestureConfig } from './useHover';
export type { HoverGestureType, HoverGestureEvent };
export { useHover } from './useHover';

export type { ManualGestureConfig } from './useManual';
export type { ManualGestureType, ManualGestureEvent };
export { useManual } from './useManual';

export type { NativeViewGestureConfig } from './useNative';
export type { NativeGestureType, NativeGestureEvent };
export { useNative } from './useNative';

export type { PanGestureConfig } from './usePan';
export type { PanGestureType, PanGestureEvent };
export { usePan } from './usePan';

export type SingleGestureType =
  | TapGestureType
  | FlingGestureType
  | LongPressGestureType
  | PinchGestureType
  | RotationGestureType
  | HoverGestureType
  | ManualGestureType
  | NativeGestureType
  | PanGestureType;
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
