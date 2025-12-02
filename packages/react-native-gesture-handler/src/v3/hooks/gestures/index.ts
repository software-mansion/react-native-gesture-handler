import type { FlingGestureEvent, FlingGesture } from './fling/useFlingGesture';
import type { HoverGestureEvent, HoverGesture } from './hover/useHoverGesture';
import type {
  LongPressGestureEvent,
  LongPressGesture,
} from './longPress/useLongPressGesture';
import type {
  ManualGestureEvent,
  ManualGesture,
} from './manual/useManualGesture';
import type {
  NativeGestureEvent,
  NativeGesture,
} from './native/useNativeGesture';
import type { PanGestureEvent, PanGesture } from './pan/usePanGesture';
import type { PinchGestureEvent, PinchGesture } from './pinch/usePinchGesture';
import type {
  RotationGestureEvent,
  RotationGesture,
} from './rotation/useRotationGesture';
import type { TapGestureEvent, TapGesture } from './tap/useTapGesture';

export type { TapGestureConfig } from './tap/useTapGesture';
export type { TapGesture, TapGestureEvent };
export { useTapGesture } from './tap/useTapGesture';

export type { FlingGestureConfig } from './fling/useFlingGesture';
export type { FlingGesture, FlingGestureEvent };
export { useFlingGesture } from './fling/useFlingGesture';

export type { LongPressGestureConfig } from './longPress/useLongPressGesture';
export type { LongPressGesture, LongPressGestureEvent };
export { useLongPressGesture } from './longPress/useLongPressGesture';

export type { PinchGestureConfig } from './pinch/usePinchGesture';
export type { PinchGesture, PinchGestureEvent };
export { usePinchGesture } from './pinch/usePinchGesture';

export type { RotationGestureConfig } from './rotation/useRotationGesture';
export type { RotationGesture, RotationGestureEvent };
export { useRotationGesture } from './rotation/useRotationGesture';

export type { HoverGestureConfig } from './hover/useHoverGesture';
export type { HoverGesture, HoverGestureEvent };
export { useHoverGesture } from './hover/useHoverGesture';

export type { ManualGestureConfig } from './manual/useManualGesture';
export type { ManualGesture, ManualGestureEvent };
export { useManualGesture } from './manual/useManualGesture';

export type { NativeViewGestureConfig } from './native/useNativeGesture';
export type { NativeGesture, NativeGestureEvent };
export { useNativeGesture } from './native/useNativeGesture';

export type { PanGestureConfig } from './pan/usePanGesture';
export type { PanGesture, PanGestureEvent };
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

export type SingleGestureEvent =
  | TapGestureEvent
  | FlingGestureEvent
  | LongPressGestureEvent
  | RotationGestureEvent
  | HoverGestureEvent
  | ManualGestureEvent
  | NativeGestureEvent
  | PanGestureEvent;
