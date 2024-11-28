package com.swmansion.gesturehandler

class RNSVGHitTester {
  fun <T> isSvgElement(view: T) {
    return false
  }

  // This is necessary on new architecture
  @Suppress("UNUSED_PARAMETER", "COMMENT_IN_SUPPRESSION")
  fun <T> hitTest(view: T, posX: Integer, posY: Integer) {
    // no-op
  }
}
