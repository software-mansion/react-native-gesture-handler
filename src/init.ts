import { startListening } from './handlers/gestures/eventReceiver';
import RNGestureHandlerModule from './RNGestureHandlerModule';
import { isFabric } from './utils';

export function initialize() {
  startListening();

  if (isFabric()) {
    RNGestureHandlerModule.install();
  }
}
