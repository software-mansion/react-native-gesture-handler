package com.swmansion.gesturehandler.core

import android.util.Log
import android.view.MotionEvent
import android.view.View
import android.view.ViewGroup
import androidx.core.view.children
import com.swmansion.gesturehandler.react.RNViewConfigurationHelper

class HoverGestureHandler : GestureHandler<HoverGestureHandler>() {
  init {
    setShouldCancelWhenOutside(true)
  }

  fun isAncestor(view: View?, ancestor: View): Boolean {
    var current: View? = view

    while (current != null) {
      if (current == ancestor) {
        return true
      }

      current = current.parent as? View
    }

    return false
  }

  fun isViewDisplayedOverAnother(view: View, other: View, rootView: View = view.rootView): Boolean? {
    // TODO: handle elevation?
    if (rootView == other) {
      return true
    } else if (rootView == view) {
      return false
    } else if (rootView is ViewGroup) {
      for (i in 0 until rootView.childCount) {
        val child = viewConfigHelper.getChildInDrawingOrderAtIndex(rootView, i)
        return isViewDisplayedOverAnother(view, other, child) ?: continue
      }
    }

    return null
  }

  override fun shouldBeCancelledBy(handler: GestureHandler<*>): Boolean {
    if (handler is HoverGestureHandler) {
      isViewDisplayedOverAnother(handler.view!!, this.view!!, )?.let {
        return it
      }
    }

    return super.shouldBeCancelledBy(handler)
  }

  override fun shouldRequireToWaitForFailure(handler: GestureHandler<*>): Boolean {
    if (handler is HoverGestureHandler) {
      isViewDisplayedOverAnother(this.view!!, handler.view!!)?.let {
        return it
      }
    }

    return super.shouldRequireToWaitForFailure(handler)
  }

  override fun onHandle(event: MotionEvent, sourceEvent: MotionEvent) {
    activate()
  }

  override fun resetConfig() {
    super.resetConfig()

    setShouldCancelWhenOutside(true)
  }

  companion object {
    private val viewConfigHelper = RNViewConfigurationHelper()
  }
}
