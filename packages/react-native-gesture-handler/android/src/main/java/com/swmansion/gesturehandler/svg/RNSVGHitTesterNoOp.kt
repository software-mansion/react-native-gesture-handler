package com.swmansion.gesturehandler.svg

import android.view.View

class RNSVGHitTesterNoOp : RNSVGHitTester {
  override fun isSvgElement(view: Any) = false

  override fun hitTest(view: View, posX: Float, posY: Float) = false
}

