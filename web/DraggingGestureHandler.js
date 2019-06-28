import GestureHandler from './GestureHandler';

class DraggingGestureHandler extends GestureHandler {
  get shouldEnableGestureOnSetup() {
    return true;
  }

  transformNativeEvent({ deltaX, deltaY, velocityX, velocityY, center: { x, y } }) {
    return {
      translationX: deltaX - (this.__initialX || 0),
      translationY: deltaY - (this.__initialY || 0),
      absoluteX: x,
      absoluteY: y,
      velocityX,
      velocityY,
      x,
      y,
    };
  }
}

export default DraggingGestureHandler;
