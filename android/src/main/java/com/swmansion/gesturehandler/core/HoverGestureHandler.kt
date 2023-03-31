package com.swmansion.gesturehandler.core

import android.view.MotionEvent
import android.view.View
import android.view.ViewGroup
import com.swmansion.gesturehandler.react.RNViewConfigurationHelper

class HoverGestureHandler : GestureHandler<HoverGestureHandler>() {
  private infix fun isAncestorOf(other: GestureHandler<*>): Boolean {
    var current: View? = other.view

    while (current != null) {
      if (current == this.view) {
        return true
      }

      current = current.parent as? View
    }

    return false
  }

  private fun isViewDisplayedOverAnother(view: View, other: View, rootView: View = view.rootView): Boolean? {
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
      if (!(handler isAncestorOf this)) {
        isViewDisplayedOverAnother(handler.view!!, this.view!!)?.let {
          return it
        }
      }
    }

    return super.shouldBeCancelledBy(handler)
  }

  override fun shouldRequireToWaitForFailure(handler: GestureHandler<*>): Boolean {
    if (handler is HoverGestureHandler) {
      if (!(this isAncestorOf handler) && !(handler isAncestorOf this)) {
        isViewDisplayedOverAnother(this.view!!, handler.view!!)?.let {
          return it
        }
      }
    }

    return super.shouldRequireToWaitForFailure(handler)
  }

  override fun shouldRecognizeSimultaneously(handler: GestureHandler<*>): Boolean {
    if (handler is HoverGestureHandler && (this isAncestorOf handler || handler isAncestorOf this)) {
      return true
    }

    return super.shouldRecognizeSimultaneously(handler)
  }

  override fun onHandle(event: MotionEvent, sourceEvent: MotionEvent) {
    if (event.action == MotionEvent.ACTION_HOVER_EXIT || !isWithinBounds) {
      when (this.state) {
        STATE_UNDETERMINED, STATE_BEGAN -> fail()
        STATE_ACTIVE -> end()
      }
    } else if (event.action == MotionEvent.ACTION_HOVER_MOVE || event.action == MotionEvent.ACTION_HOVER_ENTER) {
      when (this.state) {
        STATE_UNDETERMINED -> begin()
        STATE_BEGAN -> activate()
      }
    }

    // should hover finish on touch (atm. it does probably `ACTION_HOVER_EXIT`, it doesn't on iOS)?
    // if so, fix double finalize event when touching hovered view and dragging outside

    // iOS doesn't seem to like absolutely positioned views on top of each other even if
    // gestures are simultaneous, reproduce here?
  }

  companion object {
    private val viewConfigHelper = RNViewConfigurationHelper()
  }
}
