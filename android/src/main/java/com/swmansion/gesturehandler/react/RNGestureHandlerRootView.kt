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
  private var mEnabled = false
  private var mRootHelper: RNGestureHandlerRootHelper? = null
  override fun onAttachedToWindow() {
    super.onAttachedToWindow()
    mEnabled = !hasGestureHandlerEnabledRootView(this)
    if (!mEnabled) {
      Log.i(
        ReactConstants.TAG,
        "[GESTURE HANDLER] Gesture handler is already enabled for a parent view")
    }
    if (mEnabled && mRootHelper == null) {
      mRootHelper = RNGestureHandlerRootHelper(context as ReactContext, this)
    }
  }

  fun tearDown() {
    mRootHelper?.tearDown()
  }

  override fun dispatchTouchEvent(ev: MotionEvent): Boolean {
    return if (mEnabled && Assertions.assertNotNull(mRootHelper).dispatchTouchEvent(ev)) {
      true
    } else super.dispatchTouchEvent(ev)
  }

  override fun requestDisallowInterceptTouchEvent(disallowIntercept: Boolean) {
    if (mEnabled) {
      Assertions.assertNotNull(mRootHelper).requestDisallowInterceptTouchEvent(disallowIntercept)
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
