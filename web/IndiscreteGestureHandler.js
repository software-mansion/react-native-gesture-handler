import GestureHandler from './GestureHandler';

/**
 * The base class for **Rotation** and **Pinch** gesture handlers.
 */
class IndiscreteGestureHandler extends GestureHandler {
  updateGestureConfig({ minPointers = 2, maxPointers = 2, ...props }) {
    return super.updateGestureConfig({
      minPointers,
      maxPointers,
      ...props,
    });
  }

  get shouldEnableGestureOnSetup() {
    return false;
  }

  isGestureEnabledForEvent(
    { minPointers, maxPointers },
    recognizer,
    { maxPointers: pointerLength }
  ) {
    if (pointerLength > maxPointers) {
      return { failed: true };
    }
    const validPointerCount = pointerLength >= minPointers;
    return {
      success: validPointerCount,
    };
  }
}
export default IndiscreteGestureHandler;
