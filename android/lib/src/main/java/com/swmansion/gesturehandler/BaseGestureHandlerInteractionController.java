package com.swmansion.gesturehandler;

public abstract class BaseGestureHandlerInteractionController
        implements GestureHandlerInteractionController {

  @Override
  public boolean shouldWaitForHandlerFailure(GestureHandler handler,
                                             GestureHandler otherHandler) {
    return false;
  }

  @Override
  public boolean shouldRequireHandlerToWaitForFailure(GestureHandler handler,
                                                      GestureHandler otherHandler) {
    return false;
  }

  @Override
  public boolean shouldRecognizeSimultaneously(GestureHandler handler,
                                               GestureHandler otherHandler) {
    return false;
  }

  @Override
  public int[] getSimultaneousRelations(GestureHandler handler) {
    return new int[0];
  }
}
