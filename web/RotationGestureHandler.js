import Hammer from 'hammerjs';

import IndiscreteGestureHandler from './IndiscreteGestureHandler';

class RotationGestureHandler extends IndiscreteGestureHandler {
  get name() {
    return 'rotate';
  }

  createNativeGesture({ manager, props }) {
    manager.add(new Hammer.Rotate({ pointers: props.minPointers }));
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
