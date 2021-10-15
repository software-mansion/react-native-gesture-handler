package com.swmansion.gesturehandler

interface GestureHandlerInteractionController {
  fun shouldWaitForHandlerFailure(handler: GestureHandler<*>, otherHandler: GestureHandler<*>): Boolean
  fun shouldRequireHandlerToWaitForFailure(handler: GestureHandler<*>, otherHandler: GestureHandler<*>): Boolean
  fun shouldRecognizeSimultaneously(handler: GestureHandler<*>, otherHandler: GestureHandler<*>): Boolean
  fun shouldHandlerBeCancelledBy(handler: GestureHandler<*>, otherHandler: GestureHandler<*>): Boolean

  /**
   * This method allows already active handlers to influence the activation of the other ones.
   * Its main purpose is to fix continuous multi-touch gestures inside of a scrollView that allow
   * for some of the pointers to be lifted up and placed back down without ending the gesture.
   */
  fun needsToPreventOtherHandlerFromActivating(handler: GestureHandler<*>, otherHandler: GestureHandler<*>): Boolean
}
