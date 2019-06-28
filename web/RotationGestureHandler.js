import Hammer from 'hammerjs';

import IndiscreteGestureHandler from './IndiscreteGestureHandler';

class RotationGestureHandler extends IndiscreteGestureHandler {
  get name() {
    return 'rotate';
  }

  createNativeGesture({ minPointers }) {
    return new Hammer.Rotate({ pointers: minPointers });
  }

  parseNativeEvent({ anchorX, anchorY, velocity, rotation }) {
    return {
      anchorX,
      anchorY,
      velocity,
      rotation,
    };
  }
}
export default RotationGestureHandler;
