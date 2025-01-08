package com.swmansion.gesturehandler

import androidx.core.view.children
import com.horcrux.svg.SvgView
import com.horcrux.svg.VirtualView

class RNSVGHitTester {
  companion object {
    fun isSvgElement(view: Any): Boolean {
      return (view is VirtualView || view is SvgView)
    }

    fun hitTest(view: Any, posX: Float, posY: Float): Boolean {
      if (view is SvgView) {
        // get highest-order SvgView
        var highestOrderSvgView: SvgView = view
        while (isSvgElement(highestOrderSvgView.parent)) {
          if (highestOrderSvgView.parent is SvgView) {
            highestOrderSvgView = highestOrderSvgView.parent as SvgView
          }
          if (highestOrderSvgView.parent is VirtualView) {
            highestOrderSvgView = (highestOrderSvgView.parent as VirtualView).svgView
          }
        }

        val viewLocation = intArrayOf(0, 0)
        val rootLocation = intArrayOf(0, 0)

        view.getLocationOnScreen(viewLocation)
        highestOrderSvgView.getLocationOnScreen(rootLocation)

        // convert View-relative coordinates into SvgView-relative coordinates
        val rootX = posX + viewLocation[0] - rootLocation[0]
        val rootY = posY + viewLocation[1] - rootLocation[1]

        val pressedId = highestOrderSvgView.reactTagForTouch(rootX, rootY)
        val childrenIds = view.children.map { it.id }

        val hasBeenPressed = view.id == pressedId
        val hasChildBeenPressed = pressedId in childrenIds

        val pressIsInBounds = 0 < posX && posX < view.width && 0 < posY && posY < view.height

        return (hasBeenPressed || hasChildBeenPressed) && pressIsInBounds
      }

      if (view is VirtualView) {
        // get highest-order SvgView
        var highestOrderSvgView = view.svgView
        while (isSvgElement(highestOrderSvgView.parent)) {
          if (highestOrderSvgView.parent is SvgView) {
            highestOrderSvgView = highestOrderSvgView.parent as SvgView
          }
          if (highestOrderSvgView.parent is VirtualView) {
            highestOrderSvgView = (highestOrderSvgView.parent as VirtualView).svgView
          }
        }

        val viewLocation = intArrayOf(0, 0)
        val rootLocation = intArrayOf(0, 0)

        view.getLocationOnScreen(viewLocation)
        highestOrderSvgView.getLocationOnScreen(rootLocation)

        // convert View-relative coordinates into SvgView-relative coordinates
        val rootX = posX + viewLocation[0] - rootLocation[0]
        val rootY = posY + viewLocation[1] - rootLocation[1]

        return view.id == highestOrderSvgView.reactTagForTouch(rootX, rootY)
      }
      return false
    }
  }
}
