package com.swmansion.gesturehandler.svg

import android.view.View

internal object SvgHitTesterNoOp : SvgHitTester {
  override fun isSvgElement(view: Any) = false

  override fun hitTest(view: View, posX: Float, posY: Float) = false
}

