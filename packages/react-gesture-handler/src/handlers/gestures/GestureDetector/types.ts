import { GestureType } from '../gesture';
import { HandlerStateChangeEvent } from '../../gestureHandlerCommon';

export interface AttachedGestureState {
  // Array of gestures that should be attached to the view under that gesture detector
  attachedGestures: GestureType[];
  // Event handler for the gesture, returned by `useEvent` from Reanimated
  animatedEventHandler: unknown;
  // Shared value that's responsible for transferring the callbacks to the UI thread handler
  animatedHandlers: null;
  // Whether `useAnimatedGesture` should be called inside detector
  shouldUseReanimated: boolean;
  // Whether the GestureDetector is mounted
  isMounted: boolean;
}

export interface GestureDetectorState {
  firstRender: boolean;
  viewRef: Element | null;
  previousViewTag: Element | null;
  forceRebuildReanimatedEvent: boolean;
}

export interface WebEventHandler {
  onGestureHandlerEvent: (event: HandlerStateChangeEvent<unknown>) => void;
  onGestureHandlerStateChange?: (
    event: HandlerStateChangeEvent<unknown>
  ) => void;
}
