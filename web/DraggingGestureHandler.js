import GestureHandler from './GestureHandler';

class DraggingGestureHandler extends GestureHandler {
  get shouldEnableGestureOnSetup() {
    return true;
  }

  transformNativeEvent({ deltaX, deltaY, velocityX, velocityY, center: { x, y } }) {
    const rect = this.view.getBoundingClientRect(); 
    return {
      translationX: deltaX - (this.__initialX || 0),
      translationY: deltaY - (this.__initialY || 0),
      absoluteX: x,
      absoluteY: y,
      velocityX,
      velocityY,
      x: x - rect.left,
      y: y - rect.top,
    };
  }
}

export default DraggingGestureHandler;
