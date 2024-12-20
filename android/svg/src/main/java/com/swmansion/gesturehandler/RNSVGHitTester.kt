package com.swmansion.gesturehandler

import android.graphics.Matrix
import com.horcrux.svg.RenderableView
import com.horcrux.svg.SvgView

class RNSVGHitTester {
  companion object {
    fun isSvgElement(view: Any): Boolean {
      return (view is RenderableView || view is SvgView)
    }

    fun hitTest(view: Any, posX: Float, posY: Float): Boolean {
      if (view is SvgView) {
        return view.reactTagForTouch(posX, posY) != -1
      }

      if (view is RenderableView) {
        var highestView = view
        var highestRoot = view.svgView

        val pointTransformations = mutableListOf<Matrix>()

        while (highestView is SvgView || highestView is RenderableView) {
          if (highestView is RenderableView) {
            highestView = highestView.parent
          } else if (highestView is SvgView) {
            highestRoot = highestView
            pointTransformations.add(highestView.mInvViewBoxMatrix)
            highestView = highestView.parent
          }
        }

        val viewLocation = intArrayOf(0, 0)
        val rootLocation = intArrayOf(0, 0)

        view.getLocationOnScreen(viewLocation)
        highestRoot?.getLocationOnScreen(rootLocation)
        // all transformations and bounds are relative to the highest-order SvgView

        val rootX = posX + viewLocation[0] - rootLocation[0]
        val rootY = posY + viewLocation[1] - rootLocation[1]

        val transformed = floatArrayOf(rootX, rootY)

        pointTransformations.reverse()

        for (matrix in pointTransformations) {
          matrix.mapPoints(transformed)
        }

        return view.hitTest(transformed) != -1
      }
      return false
    }
  }
}
