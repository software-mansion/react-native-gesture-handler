import Hammer from 'hammerjs';

import IndiscreteGestureHandler from './IndiscreteGestureHandler';

class PinchGestureHandler extends IndiscreteGestureHandler {
  get name() {
    return 'pinch';
  }

  createNativeGesture({ manager, props }) {
    manager.add(new Hammer.Pinch({ pointers: props.minPointers }));
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
