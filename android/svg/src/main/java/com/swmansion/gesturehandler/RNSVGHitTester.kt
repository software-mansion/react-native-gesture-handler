package com.swmansion.gesturehandler

import com.horcrux.svg.RenderableView

class RNSVGHitTester {
  companion object {
    fun isSvgElement(view: Any): Boolean {
      return (view is RenderableView)
    }

    fun hitTest(view: Any, posX: Float, posY: Float): Boolean {
      if (view is RenderableView) {
        val viewLocation = intArrayOf(0, 0)
        val rootLocation = intArrayOf(0, 0)

        view.getLocationOnScreen(viewLocation)
        view.getSvgView()?.getLocationOnScreen(rootLocation)

        val rootX = posX + viewLocation[0] - rootLocation[0]
        val rootY = posY + viewLocation[1] - rootLocation[1]

        return view.id == view.getSvgView()?.reactTagForTouch(rootX, rootY)
      }
      return false
    }
  }
}
