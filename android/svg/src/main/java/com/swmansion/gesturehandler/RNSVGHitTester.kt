package com.swmansion.gesturehandler

import com.horcrux.svg.RenderableView

class RNSVGHitTester {
  fun <T> isSvgElement(view: T) {
    return (view instanceof RenderableView);
  }

  @Suppress("UNUSED_PARAMETER", "COMMENT_IN_SUPPRESSION")
  fun hitTest(view: RenderableView, posX: Integer, posY: Integer) {
    // view.hitTest(...);
  }
}
