/* eslint-disable eslint-comments/no-unlimited-disable */
/* eslint-disable */
// @ts-nocheck TODO(TS) provide types
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
  }: HammerInput) {
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
