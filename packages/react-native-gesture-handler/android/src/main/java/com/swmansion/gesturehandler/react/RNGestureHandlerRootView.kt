package com.swmansion.gesturehandler.react

import android.content.Context
import android.util.Log
import android.view.MotionEvent
import android.view.View
import android.view.ViewGroup
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.UiThreadUtil
import com.facebook.react.common.ReactConstants
import com.facebook.react.uimanager.RootView
import com.facebook.react.views.view.ReactViewGroup
import com.swmansion.gesturehandler.core.GestureHandler

class RNGestureHandlerRootView(context: Context?) : ReactViewGroup(context) {
  private var moduleId: Int = -1
  private var rootViewEnabled = false
  private var unstableForceActive = false
  private var rootHelper: RNGestureHandlerRootHelper? = null // TODO: resettable lateinit

  override fun onAttachedToWindow() {
    super.onAttachedToWindow()
    rootViewEnabled = unstableForceActive || !hasGestureHandlerEnabledRootView(this)
    if (!rootViewEnabled) {
      Log.i(
        ReactConstants.TAG,
        "[GESTURE HANDLER] Gesture handler is already enabled for a parent view",
      )
    }
    if (rootViewEnabled && rootHelper == null) {
      rootHelper = RNGestureHandlerRootHelper(context as ReactContext, this, moduleId)
    }
  }

  fun setModuleId(id: Int) {
    this.moduleId = id
  }

  fun tearDown() {
    rootHelper?.tearDown()
  }

  fun recordHandlerIfNotPresentForManual(handler: GestureHandler) {
    rootHelper?.recordHandlerIfNotPresentForManual(handler)
  }

  override fun dispatchTouchEvent(event: MotionEvent) = if (rootViewEnabled && rootHelper!!.dispatchTouchEvent(event)) {
    true
  } else {
    super.dispatchTouchEvent(event)
  }

  override fun dispatchGenericMotionEvent(ev: MotionEvent) =
    if (rootViewEnabled && ev.isHoverAction() && rootHelper!!.dispatchTouchEvent(ev)) {
      true
    } else {
      super.dispatchGenericMotionEvent(ev)
    }

  override fun requestDisallowInterceptTouchEvent(disallowIntercept: Boolean) {
    if (rootViewEnabled) {
      rootHelper!!.requestDisallowInterceptTouchEvent()
    }
    super.requestDisallowInterceptTouchEvent(disallowIntercept)
  }

  fun activateNativeHandlers(view: View) {
    rootHelper?.activateNativeHandlers(view)
  }

  fun isRootViewEnabled() = rootViewEnabled

  fun setUnstableForceActive(active: Boolean) {
    this.unstableForceActive = active
  }

  companion object {
    private fun hasGestureHandlerEnabledRootView(viewGroup: ViewGroup): Boolean {
      UiThreadUtil.assertOnUiThread()

      var parent = viewGroup.parent
      while (parent != null) {
        if (parent is RNGestureHandlerRootView) {
          return true
        }
        // Checks other roots views but it's mainly for ReactModalHostView.DialogRootViewGroup
        // since modals are outside RN hierachy and we have to initialize GH's root view for it
        if (parent is RootView) {
          return false
        }
        parent = parent.parent
      }
      return false
    }
  }
}
