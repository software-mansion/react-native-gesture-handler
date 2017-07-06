package com.swmansion.gesturehandler;

public interface GestureHandlerInteractionController {
  boolean shouldWaitForHandlerFailure(GestureHandler handler);
  boolean shouldRecognizeSimultaneously(GestureHandler handler);
}
