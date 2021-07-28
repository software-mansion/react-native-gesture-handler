package com.swmansion.gesturehandler.react

import android.content.Context
import android.util.Log
import android.view.MotionEvent
import android.view.ViewGroup
import com.facebook.infer.annotation.Assertions
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.UiThreadUtil
import com.facebook.react.common.ReactConstants
import com.facebook.react.views.view.ReactViewGroup

class RNGestureHandlerRootView(context: Context?) : ReactViewGroup(context) {
  private var _enabled = false
  private var rootHelper: RNGestureHandlerRootHelper? = null
  override fun onAttachedToWindow() {
    super.onAttachedToWindow()
    _enabled = !hasGestureHandlerEnabledRootView(this)
    if (!_enabled) {
      Log.i(
        ReactConstants.TAG,
        "[GESTURE HANDLER] Gesture handler is already enabled for a parent view")
    }
    if (_enabled && rootHelper == null) {
      rootHelper = RNGestureHandlerRootHelper(context as ReactContext, this)
    }
  }

  fun tearDown() {
    rootHelper?.tearDown()
  }

  override fun dispatchTouchEvent(ev: MotionEvent): Boolean {
    return if (_enabled && Assertions.assertNotNull(rootHelper).dispatchTouchEvent(ev)) {
      true
    } else super.dispatchTouchEvent(ev)
  }

  override fun requestDisallowInterceptTouchEvent(disallowIntercept: Boolean) {
    if (_enabled) {
      Assertions.assertNotNull(rootHelper).requestDisallowInterceptTouchEvent(disallowIntercept)
    }
    super.requestDisallowInterceptTouchEvent(disallowIntercept)
  }

  companion object {
    private fun hasGestureHandlerEnabledRootView(viewGroup: ViewGroup): Boolean {
      UiThreadUtil.assertOnUiThread()
      var parent = viewGroup.parent
      while (parent != null) {
        if (parent is RNGestureHandlerEnabledRootView || parent is RNGestureHandlerRootView) {
          return true
        }
        parent = parent.parent
      }
      return false
    }
  }
}
