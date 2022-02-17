import { startListening } from './handlers/gestures/eventReceiver';
import RNGestureHandlerModule from './RNGestureHandlerModule';

export function initialize() {
  startListening();

  RNGestureHandlerModule.install();
}
