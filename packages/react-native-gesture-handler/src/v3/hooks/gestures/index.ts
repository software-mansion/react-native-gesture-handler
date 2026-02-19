import type {
  FlingGestureEvent,
  FlingGestureActiveEvent,
  FlingGesture,
  FlingGestureConfig,
} from './fling/FlingTypes';
import type {
  HoverGestureEvent,
  HoverGesture,
  HoverGestureActiveEvent,
  HoverGestureConfig,
  HoverExtendedHandlerData,
} from './hover/HoverTypes';
import type {
  LongPressGestureEvent,
  LongPressGestureActiveEvent,
  LongPressGesture,
  LongPressGestureConfig,
} from './longPress/LongPressTypes';
import type {
  ManualGestureEvent,
  ManualGestureActiveEvent,
  ManualGesture,
  ManualGestureConfig,
} from './manual/ManualTypes';
import type {
  NativeGestureEvent,
  NativeGestureActiveEvent,
  NativeGesture,
  NativeGestureConfig,
} from './native/NativeTypes';
import type {
  PanGestureEvent,
  PanGesture,
  PanGestureActiveEvent,
  PanGestureConfig,
  PanExtendedHandlerData,
} from './pan/PanTypes';
import type {
  PinchGestureEvent,
  PinchGesture,
  PinchGestureActiveEvent,
  PinchGestureConfig,
  PinchExtendedHandlerData,
} from './pinch/PinchTypes';
import type {
  RotationGestureEvent,
  RotationGestureActiveEvent,
  RotationGesture,
  RotationGestureConfig,
  RotationExtendedHandlerData,
} from './rotation/RotationTypes';
import type {
  TapGestureEvent,
  TapGesture,
  TapGestureActiveEvent,
  TapGestureConfig,
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

export type ExtendedHandlerData = PanExtendedHandlerData &
  HoverExtendedHandlerData &
  PinchExtendedHandlerData &
  RotationExtendedHandlerData;
