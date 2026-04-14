import type {
  FlingGesture,
  FlingGestureActiveEvent,
  FlingGestureConfig,
  FlingGestureEvent,
} from './fling/FlingTypes';
import type {
  HoverGesture,
  HoverGestureActiveEvent,
  HoverGestureConfig,
  HoverGestureEvent,
} from './hover/HoverTypes';
import type {
  LongPressGesture,
  LongPressGestureActiveEvent,
  LongPressGestureConfig,
  LongPressGestureEvent,
} from './longPress/LongPressTypes';
import type {
  ManualGesture,
  ManualGestureActiveEvent,
  ManualGestureConfig,
  ManualGestureEvent,
} from './manual/ManualTypes';
import type {
  NativeGesture,
  NativeGestureActiveEvent,
  NativeGestureConfig,
  NativeGestureEvent,
} from './native/NativeTypes';
import type {
  PanGesture,
  PanGestureActiveEvent,
  PanGestureConfig,
  PanGestureEvent,
} from './pan/PanTypes';
import type {
  PinchGesture,
  PinchGestureActiveEvent,
  PinchGestureConfig,
  PinchGestureEvent,
} from './pinch/PinchTypes';
import type {
  RotationGesture,
  RotationGestureActiveEvent,
  RotationGestureConfig,
  RotationGestureEvent,
} from './rotation/RotationTypes';
import type {
  TapGesture,
  TapGestureActiveEvent,
  TapGestureConfig,
  TapGestureEvent,
} from './tap/TapTypes';

export type {
  TapGesture,
  TapGestureEvent,
  TapGestureActiveEvent,
  TapGestureConfig,
};
export { useTapGesture } from './tap/useTapGesture';

export type {
  FlingGesture,
  FlingGestureConfig,
  FlingGestureEvent,
  FlingGestureActiveEvent,
};
export { useFlingGesture } from './fling/useFlingGesture';

export type {
  LongPressGesture,
  LongPressGestureEvent,
  LongPressGestureConfig,
  LongPressGestureActiveEvent,
};
export { useLongPressGesture } from './longPress/useLongPressGesture';

export type {
  PinchGesture,
  PinchGestureEvent,
  PinchGestureActiveEvent,
  PinchGestureConfig,
};
export { usePinchGesture } from './pinch/usePinchGesture';

export type {
  RotationGesture,
  RotationGestureEvent,
  RotationGestureActiveEvent,
  RotationGestureConfig,
};
export { useRotationGesture } from './rotation/useRotationGesture';

export type {
  HoverGesture,
  HoverGestureEvent,
  HoverGestureConfig,
  HoverGestureActiveEvent,
};
export { useHoverGesture } from './hover/useHoverGesture';

export type {
  ManualGesture,
  ManualGestureEvent,
  ManualGestureConfig,
  ManualGestureActiveEvent,
};
export { useManualGesture } from './manual/useManualGesture';

export type {
  NativeGesture,
  NativeGestureEvent,
  NativeGestureActiveEvent,
  NativeGestureConfig,
};
export { useNativeGesture } from './native/useNativeGesture';

export type {
  PanGesture,
  PanGestureEvent,
  PanGestureConfig,
  PanGestureActiveEvent,
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
  | TapGestureEvent
  | TapGestureActiveEvent
  | FlingGestureEvent
  | FlingGestureActiveEvent
  | LongPressGestureEvent
  | LongPressGestureActiveEvent
  | RotationGestureEvent
  | RotationGestureActiveEvent
  | HoverGestureEvent
  | HoverGestureActiveEvent
  | ManualGestureEvent
  | ManualGestureActiveEvent
  | NativeGestureEvent
  | NativeGestureActiveEvent
  | PanGestureEvent
  | PanGestureActiveEvent;
/* eslint-enable @typescript-eslint/no-duplicate-type-constituents */
