/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
// @ts-nocheck TODO(TS) provide types
import Hammer from '@egjs/hammerjs';

import IndiscreteGestureHandler from './IndiscreteGestureHandler';

class PinchGestureHandler extends IndiscreteGestureHandler {
  get name() {
    return 'pinch';
  }

  get NativeGestureClass() {
    return Hammer.Pinch;
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
