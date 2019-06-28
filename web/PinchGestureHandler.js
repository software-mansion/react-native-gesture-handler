import Hammer from 'hammerjs';

import IndiscreteGestureHandler from './IndiscreteGestureHandler';

class PinchGestureHandler extends IndiscreteGestureHandler {
  get name() {
    return 'pinch';
  }

  createNativeGesture({ minPointers }) {
    return new Hammer.Pinch({ pointers: minPointers });
  }

  transformNativeEvent({ scale, velocity, center }) {
    return {
      focalX: center.x,
      focalY: center.y,
      velocity,
      scale,
    };
  }
}

export default PinchGestureHandler;
