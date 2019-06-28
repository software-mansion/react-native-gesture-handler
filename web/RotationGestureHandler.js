import Hammer from 'hammerjs';

import { DEG_RAD } from './constants';
import IndiscreteGestureHandler from './IndiscreteGestureHandler';

class RotationGestureHandler extends IndiscreteGestureHandler {
  get name() {
    return 'rotate';
  }

  createNativeGesture({ minPointers }) {
    return new Hammer.Rotate({ pointers: minPointers });
  }

  transformNativeEvent({ rotation, velocity, center }) {
    const deltaRotation = (rotation - this.initialRotation) * DEG_RAD;

    return {
      rotation: deltaRotation,
      anchorX: center.x,
      anchorY: center.y,
      velocity,
    };
  }
}
export default RotationGestureHandler;
