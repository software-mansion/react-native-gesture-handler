import Hammer from 'hammerjs';

import IndiscreteGestureHandler from './IndiscreteGestureHandler';

class PinchGestureHandler extends IndiscreteGestureHandler {
  get name() {
    return 'pinch';
  }

  createNativeGesture({ minPointers }) {
    return new Hammer.Pinch({ pointers: minPointers });
  }

  parseNativeEvent({ scale, velocity, focalX, focalY }) {
    return {
      scale,
      velocity,
      focalX,
      focalY,
    };
  }
}

export default PinchGestureHandler;
