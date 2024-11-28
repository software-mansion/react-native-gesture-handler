package com.swmansion.gesturehandler

import com.horcrux.svg.RenderableView

class RNSVGHitTester {
  companion object {
    fun isSvgElement(view: Any): Boolean {
      return (view is RenderableView)
    }

    fun hitTest(view: Any, posX: Float, posY: Float): Boolean {
      if (view is RenderableView) {
        return view.hitTest(floatArrayOf(posX, posY)) != -1
      }
      return false
    }
  }
}
