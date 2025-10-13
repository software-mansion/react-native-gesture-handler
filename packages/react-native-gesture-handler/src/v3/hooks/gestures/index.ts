import type {
  FlingGestureStateChangeEvent,
  FlingGestureUpdateEvent,
  FlingGesture,
} from './useFling';
import type {
  HoverGestureStateChangeEvent,
  HoverGestureUpdateEvent,
  HoverGesture,
} from './useHover';
import type {
  LongPressGestureStateChangeEvent,
  LongPressGestureUpdateEvent,
  LongPressGesture,
} from './useLongPress';
import type {
  ManualGestureStateChangeEvent,
  ManualGestureUpdateEvent,
  ManualGesture,
} from './useManual';
import type {
  NativeGestureStateChangeEvent,
  NativeGestureUpdateEvent,
  NativeGesture,
} from './useNative';
import type {
  PanGestureStateChangeEvent,
  PanGestureUpdateEvent,
  PanGesture,
} from './usePan';
import type {
  PinchGestureStateChangeEvent,
  PinchGestureUpdateEvent,
  PinchGesture,
} from './usePinch';
import type {
  RotationGestureStateChangeEvent,
  RotationGestureUpdateEvent,
  RotationGesture,
} from './useRotation';
import type {
  TapGestureStateChangeEvent,
  TapGestureUpdateEvent,
  TapGesture,
} from './useTap';

export type { TapGestureConfig } from './useTap';
export type { TapGesture, TapGestureStateChangeEvent, TapGestureUpdateEvent };
export { useTap } from './useTap';

export type { FlingGestureConfig } from './useFling';
export type {
  FlingGesture,
  FlingGestureStateChangeEvent,
  FlingGestureUpdateEvent,
};
export { useFling } from './useFling';

export type { LongPressGestureConfig } from './useLongPress';
export type {
  LongPressGesture,
  LongPressGestureStateChangeEvent,
  LongPressGestureUpdateEvent,
};
export { useLongPress } from './useLongPress';

export type { PinchGestureConfig } from './usePinch';
export type {
  PinchGesture,
  PinchGestureStateChangeEvent,
  PinchGestureUpdateEvent,
};
export { usePinch } from './usePinch';

export type { RotationGestureConfig } from './useRotation';
export type {
  RotationGesture,
  RotationGestureStateChangeEvent,
  RotationGestureUpdateEvent,
};
export { useRotation } from './useRotation';

export type { HoverGestureConfig } from './useHover';
export type {
  HoverGesture,
  HoverGestureStateChangeEvent,
  HoverGestureUpdateEvent,
};
export { useHover } from './useHover';

export type { ManualGestureConfig } from './useManual';
export type {
  ManualGesture,
  ManualGestureStateChangeEvent,
  ManualGestureUpdateEvent,
};
export { useManual } from './useManual';

export type { NativeViewGestureConfig } from './useNative';
export type {
  NativeGesture,
  NativeGestureStateChangeEvent,
  NativeGestureUpdateEvent,
};
export { useNative } from './useNative';

export type { PanGestureConfig } from './usePan';
export type { PanGesture, PanGestureStateChangeEvent, PanGestureUpdateEvent };
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

export type SingleGestureStateChangeEvent =
  | TapGestureStateChangeEvent
  | FlingGestureStateChangeEvent
  | LongPressGestureStateChangeEvent
  | RotationGestureStateChangeEvent
  | HoverGestureStateChangeEvent
  | ManualGestureStateChangeEvent
  | NativeGestureStateChangeEvent
  | PanGestureStateChangeEvent;

export type SingleGestureUpdateEvent =
  | TapGestureUpdateEvent
  | FlingGestureUpdateEvent
  | LongPressGestureUpdateEvent
  | RotationGestureUpdateEvent
  | HoverGestureUpdateEvent
  | ManualGestureUpdateEvent
  | NativeGestureUpdateEvent
  | PanGestureUpdateEvent;
