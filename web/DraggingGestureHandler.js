import GestureHandler from './GestureHandler';
import { PixelRatio } from 'react-native';

class DraggingGestureHandler extends GestureHandler {
  get shouldEnableGestureOnSetup() {
    return true;
  }

  transformNativeEvent({
    deltaX,
    deltaY,
    velocityX,
    velocityY,
    center: { x, y },
  }) {
    const rect = this.view.getBoundingClientRect();
    const ratio = PixelRatio.get();
    return {
      translationX: deltaX - (this.__initialX || 0),
      translationY: deltaY - (this.__initialY || 0),
      absoluteX: x,
      absoluteY: y,
      velocityX: velocityX * ratio,
      velocityY: velocityY * ratio,
      x: x - rect.left,
      y: y - rect.top,
    };
  }
}

export default DraggingGestureHandler;
