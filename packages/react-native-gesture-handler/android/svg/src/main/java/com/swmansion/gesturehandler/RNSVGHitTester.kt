package com.swmansion.gesturehandler

import android.view.View
import com.swmansion.gesturehandler.svg.RNSVGHitTesterHelper

class RNSVGHitTester {
  companion object {
    private val delegate by lazy { RNSVGHitTesterHelper.provide() }

    fun isSvgElement(view: Any): Boolean = delegate.isSvgElement(view)

    fun hitTest(view: View, posX: Float, posY: Float): Boolean = delegate.hitTest(view, posX, posY)
  }
}

