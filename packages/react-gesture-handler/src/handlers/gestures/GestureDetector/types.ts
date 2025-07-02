import { GestureType } from '../gesture';
import { HandlerStateChangeEvent } from '../../gestureHandlerCommon';

export interface AttachedGestureState {
  // Array of gestures that should be attached to the view under that gesture detector
  attachedGestures: GestureType[];
  // Whether the GestureDetector is mounted
  isMounted: boolean;
}

export interface GestureDetectorState {
  firstRender: boolean;
  viewRef: Element | null;
  previousViewTag: Element | null;
}

export interface WebEventHandler {
  onGestureHandlerEvent: (event: HandlerStateChangeEvent<unknown>) => void;
  onGestureHandlerStateChange?: (
    event: HandlerStateChangeEvent<unknown>
  ) => void;
}
