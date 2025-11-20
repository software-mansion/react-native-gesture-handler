package com.swmansion.gesturehandler.svg

import android.view.View

internal interface SvgHitTester {
  fun isSvgElement(view: Any): Boolean
  fun hitTest(view: View, posX: Float, posY: Float): Boolean
}

