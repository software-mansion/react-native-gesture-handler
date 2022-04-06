import { startListening } from './handlers/gestures/eventReceiver';
import RNGestureHandlerModule from './RNGestureHandlerModule';
import { isFabric } from './utils';

let fabricInitialized = false;

export function initialize() {
  startListening();
}

// since isFabric() may give wrong results before the first render, we call this
// method during render of GestureHandlerRootView
export function maybeInitializeFabric() {
  if (isFabric() && !fabricInitialized) {
    RNGestureHandlerModule.install();
    fabricInitialized = true;
  }
}
