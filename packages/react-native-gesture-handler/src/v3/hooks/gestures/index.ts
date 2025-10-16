import type {
  FlingGestureStateChangeEvent,
  FlingGestureUpdateEvent,
  FlingGesture,
} from './fling/useFling';
import type {
  HoverGestureStateChangeEvent,
  HoverGestureUpdateEvent,
  HoverGesture,
} from './hover/useHover';
import type {
  LongPressGestureStateChangeEvent,
  LongPressGestureUpdateEvent,
  LongPressGesture,
} from './longPress/useLongPress';
import type {
  ManualGestureStateChangeEvent,
  ManualGestureUpdateEvent,
  ManualGesture,
} from './manual/useManual';
import type {
  NativeGestureStateChangeEvent,
  NativeGestureUpdateEvent,
  NativeGesture,
} from './native/useNative';
import type {
  PanGestureStateChangeEvent,
  PanGestureUpdateEvent,
  PanGesture,
} from './pan/usePan';
import type {
  PinchGestureStateChangeEvent,
  PinchGestureUpdateEvent,
  PinchGesture,
} from './pinch/usePinch';
import type {
  RotationGestureStateChangeEvent,
  RotationGestureUpdateEvent,
  RotationGesture,
} from './rotation/useRotation';
import type {
  TapGestureStateChangeEvent,
  TapGestureUpdateEvent,
  TapGesture,
} from './tap/useTap';

export type { TapGestureConfig } from './tap/useTap';
export type { TapGesture, TapGestureStateChangeEvent, TapGestureUpdateEvent };
export { useTap } from './tap/useTap';

export type { FlingGestureConfig } from './fling/useFling';
export type {
  FlingGesture,
  FlingGestureStateChangeEvent,
  FlingGestureUpdateEvent,
};
export { useFling } from './fling/useFling';

export type { LongPressGestureConfig } from './longPress/useLongPress';
export type {
  LongPressGesture,
  LongPressGestureStateChangeEvent,
  LongPressGestureUpdateEvent,
};
export { useLongPress } from './longPress/useLongPress';

export type { PinchGestureConfig } from './pinch/usePinch';
export type {
  PinchGesture,
  PinchGestureStateChangeEvent,
  PinchGestureUpdateEvent,
};
export { usePinch } from './pinch/usePinch';

export type { RotationGestureConfig } from './rotation/useRotation';
export type {
  RotationGesture,
  RotationGestureStateChangeEvent,
  RotationGestureUpdateEvent,
};
export { useRotation } from './rotation/useRotation';

export type { HoverGestureConfig } from './hover/useHover';
export type {
  HoverGesture,
  HoverGestureStateChangeEvent,
  HoverGestureUpdateEvent,
};
export { useHover } from './hover/useHover';

export type { ManualGestureConfig } from './manual/useManual';
export type {
  ManualGesture,
  ManualGestureStateChangeEvent,
  ManualGestureUpdateEvent,
};
export { useManual } from './manual/useManual';

export type { NativeViewGestureConfig } from './native/useNative';
export type {
  NativeGesture,
  NativeGestureStateChangeEvent,
  NativeGestureUpdateEvent,
};
export { useNative } from './native/useNative';

export type { PanGestureConfig } from './pan/usePan';
export type { PanGesture, PanGestureStateChangeEvent, PanGestureUpdateEvent };
export { usePan } from './pan/usePan';

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
