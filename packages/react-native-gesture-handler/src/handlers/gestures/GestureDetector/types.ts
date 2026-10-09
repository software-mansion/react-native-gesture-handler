import type { SharedValue } from '../../../v3/types';
import type { GestureType, HandlerCallbacks } from '../gesture';

export interface AttachedGestureState {
  // Array of gestures that should be attached to the view under that gesture detector
  attachedGestures: GestureType[];
  // Event handler for the gesture, returned by `useEvent` from Reanimated
  animatedEventHandler: unknown;
  // Shared value that's responsible for transferring the callbacks to the UI thread handler
  animatedHandlers: SharedValue<
    HandlerCallbacks<Record<string, unknown>>[] | null
  > | null;
  // Whether `useAnimatedGesture` should be called inside detector
  shouldUseReanimated: boolean;
  // Whether the GestureDetector is mounted
  isMounted: boolean;
  // Whether any attached gesture has a relation to a gesture outside this
  // detector (a ref or a gesture object), which may resolve on a later mount
  hasExternalRelations: boolean;
}

export interface GestureDetectorState {
  firstRender: boolean;
  viewRef: React.Component | null;
  previousViewTag: number;
  forceRebuildReanimatedEvent: boolean;
}
