package com.swmansion.gesturehandler

class RNSVGHitTester {
  companion object {
    @Suppress("UNUSED_PARAMETER")
    fun isSvgElement(view: Any): Boolean {
      return false
    }

    @Suppress("UNUSED_PARAMETER", "COMMENT_IN_SUPPRESSION")
    fun hitTest(view: Any, posX: Float, posY: Float): Boolean {
      return false // never accessed
    }
  }
}
