package com.swmansion.gesturehandler

import android.view.View
import androidx.core.view.children
import com.horcrux.svg.SvgView
import com.horcrux.svg.VirtualView

class RNSVGHitTester {
  companion object {
    private fun getRootSvgView(view: Any): SvgView {
      var rootSvgView: SvgView

      rootSvgView = if (view is VirtualView) {
        view.svgView!!
      } else {
        view as SvgView
      }

      while (isSvgElement(rootSvgView.parent)) {
        rootSvgView = if (rootSvgView.parent is VirtualView) {
          (rootSvgView.parent as VirtualView).svgView!!
        } else {
          rootSvgView.parent as SvgView
        }
      }

      return rootSvgView
    }

    fun isSvgElement(view: Any): Boolean {
      return (view is VirtualView || view is SvgView)
    }

    fun hitTest(view: View, posX: Float, posY: Float): Boolean {
      val rootSvgView = getRootSvgView(view)
      val viewLocation = intArrayOf(0, 0)
      val rootLocation = intArrayOf(0, 0)

      view.getLocationOnScreen(viewLocation)
      rootSvgView.getLocationOnScreen(rootLocation)

      // convert View-relative coordinates into SvgView-relative coordinates
      val rootX = posX + viewLocation[0] - rootLocation[0]
      val rootY = posY + viewLocation[1] - rootLocation[1]

      val pressedId = rootSvgView.reactTagForTouch(rootX, rootY)

      if (view is SvgView) {
        val childrenIds = view.children.map { it.id }

        val hasBeenPressed = view.id == pressedId
        val hasChildBeenPressed = pressedId in childrenIds

        val pressIsInBounds = 0 < posX && posX < view.width && 0 < posY && posY < view.height

        return (hasBeenPressed || hasChildBeenPressed) && pressIsInBounds
      }

      if (view is VirtualView) {
        return view.id == rootSvgView.reactTagForTouch(rootX, rootY)
      }

      return false
    }
  }
}
