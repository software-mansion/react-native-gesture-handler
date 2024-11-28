package com.swmansion.gesturehandler

import com.horcrux.svg.RenderableView

class RNSVGHitTester {
  fun <T> isSvgElement(view: T): Boolean {
    return (view is RenderableView)
  }

  @Suppress("UNUSED_PARAMETER", "COMMENT_IN_SUPPRESSION")
  fun hitTest(view: RenderableView, posX: Int, posY: Int) {
    // view.hitTest(...)
  }
}
