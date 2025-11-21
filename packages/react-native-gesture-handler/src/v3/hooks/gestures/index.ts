import type {
  FlingGestureStateChangeEvent,
  FlingGestureUpdateEvent,
  FlingGesture,
} from './fling/useFlingGesture';
import type {
  HoverGestureStateChangeEvent,
  HoverGestureUpdateEvent,
  HoverGesture,
} from './hover/useHoverGesture';
import type {
  LongPressGestureStateChangeEvent,
  LongPressGestureUpdateEvent,
  LongPressGesture,
} from './longPress/useLongPressGesture';
import type {
  ManualGestureStateChangeEvent,
  ManualGestureUpdateEvent,
  ManualGesture,
} from './manual/useManualGesture';
import type {
  NativeGestureStateChangeEvent,
  NativeGestureUpdateEvent,
  NativeGesture,
} from './native/useNativeGesture';
import type {
  PanGestureStateChangeEvent,
  PanGestureUpdateEvent,
  PanGesture,
} from './pan/usePanGesture';
import type {
  PinchGestureStateChangeEvent,
  PinchGestureUpdateEvent,
  PinchGesture,
} from './pinch/usePinchGesture';
import type {
  RotationGestureStateChangeEvent,
  RotationGestureUpdateEvent,
  RotationGesture,
} from './rotation/useRotationGesture';
import type {
  TapGestureStateChangeEvent,
  TapGestureUpdateEvent,
  TapGesture,
} from './tap/useTapGesture';

export type { TapGestureConfig } from './tap/useTapGesture';
export type { TapGesture, TapGestureStateChangeEvent, TapGestureUpdateEvent };
export { useTapGesture } from './tap/useTapGesture';

export type { FlingGestureConfig } from './fling/useFlingGesture';
export type {
  FlingGesture,
  FlingGestureStateChangeEvent,
  FlingGestureUpdateEvent,
};
export { useFlingGesture } from './fling/useFlingGesture';

export type { LongPressGestureConfig } from './longPress/useLongPressGesture';
export type {
  LongPressGesture,
  LongPressGestureStateChangeEvent,
  LongPressGestureUpdateEvent,
};
export { useLongPressGesture } from './longPress/useLongPressGesture';

export type { PinchGestureConfig } from './pinch/usePinchGesture';
export type {
  PinchGesture,
  PinchGestureStateChangeEvent,
  PinchGestureUpdateEvent,
};
export { usePinchGesture } from './pinch/usePinchGesture';

export type { RotationGestureConfig } from './rotation/useRotationGesture';
export type {
  RotationGesture,
  RotationGestureStateChangeEvent,
  RotationGestureUpdateEvent,
};
export { useRotationGesture } from './rotation/useRotationGesture';

export type { HoverGestureConfig } from './hover/useHoverGesture';
export type {
  HoverGesture,
  HoverGestureStateChangeEvent,
  HoverGestureUpdateEvent,
};
export { useHoverGesture } from './hover/useHoverGesture';

export type { ManualGestureConfig } from './manual/useManualGesture';
export type {
  ManualGesture,
  ManualGestureStateChangeEvent,
  ManualGestureUpdateEvent,
};
export { useManualGesture } from './manual/useManualGesture';

export type { NativeViewGestureConfig } from './native/useNativeGesture';
export type {
  NativeGesture,
  NativeGestureStateChangeEvent,
  NativeGestureUpdateEvent,
};
export { useNativeGesture } from './native/useNativeGesture';

export type { PanGestureConfig } from './pan/usePanGesture';
export type { PanGesture, PanGestureStateChangeEvent, PanGestureUpdateEvent };
export { usePanGesture } from './pan/usePanGesture';

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
