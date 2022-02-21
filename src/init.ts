import { startListening } from './handlers/gestures/eventReceiver';
import RNGestureHandlerModule from './RNGestureHandlerModule';
import { ENABLE_FABRIC } from './utils';

export function initialize() {
  startListening();

  if (ENABLE_FABRIC) {
    RNGestureHandlerModule.install();
  }
}
