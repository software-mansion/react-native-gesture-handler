package com.swmansion.gesturehandler;

public abstract class BaseGestureHandlerInteractionController
        implements GestureHandlerInteractionController {

  @Override
  public boolean shouldWaitForHandlerFailure(GestureHandler handler) {
    return false;
  }

  @Override
  public boolean shouldRequireHandlerToWaitForFailure(GestureHandler handler) {
    return false;
  }

  @Override
  public boolean shouldRecognizeSimultaneously(GestureHandler handler) {
    return false;
  }
}
