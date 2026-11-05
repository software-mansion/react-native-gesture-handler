import type {
  FlingGesture,
  FlingGestureActiveEvent,
  FlingGestureBeginEvent,
  FlingGestureConfig,
  FlingGestureDeactivateEvent,
  FlingGestureEvent,
  FlingGestureFinalizeEvent,
} from './fling/FlingTypes';
import type {
  HoverGesture,
  HoverGestureActiveEvent,
  HoverGestureBeginEvent,
  HoverGestureConfig,
  HoverGestureDeactivateEvent,
  HoverGestureEvent,
  HoverGestureFinalizeEvent,
} from './hover/HoverTypes';
import type {
  LongPressGesture,
  LongPressGestureActiveEvent,
  LongPressGestureBeginEvent,
  LongPressGestureConfig,
  LongPressGestureDeactivateEvent,
  LongPressGestureEvent,
  LongPressGestureFinalizeEvent,
} from './longPress/LongPressTypes';
import type {
  ManualGesture,
  ManualGestureActiveEvent,
  ManualGestureBeginEvent,
  ManualGestureConfig,
  ManualGestureDeactivateEvent,
  ManualGestureEvent,
  ManualGestureFinalizeEvent,
} from './manual/ManualTypes';
import type {
  NativeGesture,
  NativeGestureActiveEvent,
  NativeGestureBeginEvent,
  NativeGestureConfig,
  NativeGestureDeactivateEvent,
  NativeGestureEvent,
  NativeGestureFinalizeEvent,
} from './native/NativeTypes';
import type {
  PanGesture,
  PanGestureActiveEvent,
  PanGestureBeginEvent,
  PanGestureConfig,
  PanGestureDeactivateEvent,
  PanGestureEvent,
  PanGestureFinalizeEvent,
} from './pan/PanTypes';
import type {
  PinchGesture,
  PinchGestureActiveEvent,
  PinchGestureBeginEvent,
  PinchGestureConfig,
  PinchGestureDeactivateEvent,
  PinchGestureEvent,
  PinchGestureFinalizeEvent,
} from './pinch/PinchTypes';
import type {
  RotationGesture,
  RotationGestureActiveEvent,
  RotationGestureBeginEvent,
  RotationGestureConfig,
  RotationGestureDeactivateEvent,
  RotationGestureEvent,
  RotationGestureFinalizeEvent,
} from './rotation/RotationTypes';
import type {
  TapGesture,
  TapGestureActiveEvent,
  TapGestureBeginEvent,
  TapGestureConfig,
  TapGestureDeactivateEvent,
  TapGestureEvent,
  TapGestureFinalizeEvent,
} from './tap/TapTypes';

export type {
  TapGesture,
  TapGestureActiveEvent,
  TapGestureBeginEvent,
  TapGestureConfig,
  TapGestureDeactivateEvent,
  TapGestureEvent,
  TapGestureFinalizeEvent,
};
export { useTapGesture } from './tap/useTapGesture';

export type {
  FlingGesture,
  FlingGestureActiveEvent,
  FlingGestureBeginEvent,
  FlingGestureConfig,
  FlingGestureDeactivateEvent,
  FlingGestureEvent,
  FlingGestureFinalizeEvent,
};
export { useFlingGesture } from './fling/useFlingGesture';

export type {
  LongPressGesture,
  LongPressGestureActiveEvent,
  LongPressGestureBeginEvent,
  LongPressGestureConfig,
  LongPressGestureDeactivateEvent,
  LongPressGestureEvent,
  LongPressGestureFinalizeEvent,
};
export { useLongPressGesture } from './longPress/useLongPressGesture';

export type {
  PinchGesture,
  PinchGestureActiveEvent,
  PinchGestureBeginEvent,
  PinchGestureConfig,
  PinchGestureDeactivateEvent,
  PinchGestureEvent,
  PinchGestureFinalizeEvent,
};
export { usePinchGesture } from './pinch/usePinchGesture';

export type {
  RotationGesture,
  RotationGestureActiveEvent,
  RotationGestureBeginEvent,
  RotationGestureConfig,
  RotationGestureDeactivateEvent,
  RotationGestureEvent,
  RotationGestureFinalizeEvent,
};
export { useRotationGesture } from './rotation/useRotationGesture';

export type {
  HoverGesture,
  HoverGestureActiveEvent,
  HoverGestureBeginEvent,
  HoverGestureConfig,
  HoverGestureDeactivateEvent,
  HoverGestureEvent,
  HoverGestureFinalizeEvent,
};
export { useHoverGesture } from './hover/useHoverGesture';

export type {
  ManualGesture,
  ManualGestureActiveEvent,
  ManualGestureBeginEvent,
  ManualGestureConfig,
  ManualGestureDeactivateEvent,
  ManualGestureEvent,
  ManualGestureFinalizeEvent,
};
export { useManualGesture } from './manual/useManualGesture';

export type {
  NativeGesture,
  NativeGestureActiveEvent,
  NativeGestureBeginEvent,
  NativeGestureConfig,
  NativeGestureDeactivateEvent,
  NativeGestureEvent,
  NativeGestureFinalizeEvent,
};
export { useNativeGesture } from './native/useNativeGesture';

export type {
  PanGesture,
  PanGestureActiveEvent,
  PanGestureBeginEvent,
  PanGestureConfig,
  PanGestureDeactivateEvent,
  PanGestureEvent,
  PanGestureFinalizeEvent,
};
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

/* eslint-disable @typescript-eslint/no-duplicate-type-constituents */
export type SingleGestureEvent =
  | TapGestureBeginEvent
  | TapGestureActiveEvent
  | TapGestureDeactivateEvent
  | TapGestureFinalizeEvent
  | FlingGestureBeginEvent
  | FlingGestureActiveEvent
  | FlingGestureDeactivateEvent
  | FlingGestureFinalizeEvent
  | LongPressGestureBeginEvent
  | LongPressGestureActiveEvent
  | LongPressGestureDeactivateEvent
  | LongPressGestureFinalizeEvent
  | PinchGestureBeginEvent
  | PinchGestureActiveEvent
  | PinchGestureDeactivateEvent
  | PinchGestureFinalizeEvent
  | RotationGestureBeginEvent
  | RotationGestureActiveEvent
  | RotationGestureDeactivateEvent
  | RotationGestureFinalizeEvent
  | HoverGestureBeginEvent
  | HoverGestureActiveEvent
  | HoverGestureDeactivateEvent
  | HoverGestureFinalizeEvent
  | ManualGestureBeginEvent
  | ManualGestureActiveEvent
  | ManualGestureDeactivateEvent
  | ManualGestureFinalizeEvent
  | NativeGestureBeginEvent
  | NativeGestureActiveEvent
  | NativeGestureDeactivateEvent
  | NativeGestureFinalizeEvent
  | PanGestureBeginEvent
  | PanGestureActiveEvent
  | PanGestureDeactivateEvent
  | PanGestureFinalizeEvent;
/* eslint-enable @typescript-eslint/no-duplicate-type-constituents */
