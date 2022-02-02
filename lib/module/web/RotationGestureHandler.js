import Hammer from '@egjs/hammerjs';
import { DEG_RAD } from './constants';
import IndiscreteGestureHandler from './IndiscreteGestureHandler';

class RotationGestureHandler extends IndiscreteGestureHandler {
  get name() {
    return 'rotate';
  }

  get NativeGestureClass() {
    return Hammer.Rotate;
  }

  transformNativeEvent({
    rotation,
    velocity,
    center
  }) {
    var _this$initialRotation;

    return {
      rotation: (rotation - ((_this$initialRotation = this.initialRotation) !== null && _this$initialRotation !== void 0 ? _this$initialRotation : 0)) * DEG_RAD,
      anchorX: center.x,
      anchorY: center.y,
      velocity
    };
  }

}

export default RotationGestureHandler;
//# sourceMappingURL=RotationGestureHandler.js.map