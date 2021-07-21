package com.swmansion.gesturehandler.react

import android.os.SystemClock
import android.util.Log
import android.view.MotionEvent
import android.view.ViewGroup
import android.view.ViewParent
import com.facebook.react.ReactRootView
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.UiThreadUtil
import com.facebook.react.common.ReactConstants
import com.facebook.react.views.modal.RNGHModalUtils.dialogRootViewGroupOnChildStartedNativeGesture
import com.facebook.react.views.modal.RNGHModalUtils.isDialogRootViewGroup
import com.swmansion.gesturehandler.GestureHandler
import com.swmansion.gesturehandler.GestureHandlerOrchestrator

class RNGestureHandlerRootHelper(context: ReactContext, wrappedView: ViewGroup) {
  private val mContext: ReactContext
  private val mOrchestrator: GestureHandlerOrchestrator?
  private val mJSGestureHandler: GestureHandler<*>?
  val rootView: ViewGroup
  private var mShouldIntercept = false
  private var mPassingTouch = false
  fun tearDown() {
    Log.i(
      ReactConstants.TAG,
      "[GESTURE HANDLER] Tearing down gesture handler registered for root view " + rootView)
    val module = mContext.getNativeModule(RNGestureHandlerModule::class.java)
    module!!.registry.dropHandler(mJSGestureHandler!!.tag)
    module.unregisterRootHelper(this)
  }

  private inner class RootViewGestureHandler : GestureHandler<Any?>() {
    override fun onHandle(event: MotionEvent?) {
      val currentState = state
      if (currentState == STATE_UNDETERMINED) {
        begin()
        mShouldIntercept = false
      }
      if (event!!.actionMasked == MotionEvent.ACTION_UP) {
        end()
      }
    }

    override fun onCancel() {
      mShouldIntercept = true
      val time = SystemClock.uptimeMillis()
      val event = MotionEvent.obtain(time, time, MotionEvent.ACTION_CANCEL, 0f, 0f, 0)
      event.action = MotionEvent.ACTION_CANCEL
      if (rootView is ReactRootView) {
        rootView.onChildStartedNativeGesture(event)
      } else {
        dialogRootViewGroupOnChildStartedNativeGesture(rootView, event)
      }
    }
  }

  fun requestDisallowInterceptTouchEvent(disallowIntercept: Boolean) {
    // If this method gets called it means that some native view is attempting to grab lock for
    // touch event delivery. In that case we cancel all gesture recognizers
    if (mOrchestrator != null && !mPassingTouch) {
      // if we are in the process of delivering touch events via GH orchestrator, we don't want to
      // treat it as a native gesture capturing the lock
      tryCancelAllHandlers()
    }
  }

  fun dispatchTouchEvent(ev: MotionEvent?): Boolean {
    // We mark `mPassingTouch` before we get into `mOrchestrator.onTouchEvent` so that we can tell
    // if `requestDisallow` has been called as a result of a normal gesture handling process or
    // as a result of one of the gesture handlers activating
    mPassingTouch = true
    mOrchestrator!!.onTouchEvent(ev)
    mPassingTouch = false
    return mShouldIntercept
  }

  private fun tryCancelAllHandlers() {
    // In order to cancel handlers we activate handler that is hooked to the root view
    if (mJSGestureHandler != null && mJSGestureHandler.state == GestureHandler.STATE_BEGAN) {
      // Try activate main JS handler
      mJSGestureHandler.activate()
      mJSGestureHandler.end()
    }
  }

  /*package*/
  fun handleSetJSResponder(viewTag: Int, blockNativeResponder: Boolean) {
    if (blockNativeResponder) {
      UiThreadUtil.runOnUiThread { tryCancelAllHandlers() }
    }
  }

  companion object {
    private const val MIN_ALPHA_FOR_TOUCH = 0.1f
    private fun findRootViewTag(viewGroup: ViewGroup): ViewGroup {
      UiThreadUtil.assertOnUiThread()
      var parent: ViewParent? = viewGroup
      while (parent != null && !(parent is ReactRootView || isDialogRootViewGroup(parent))) {
        parent = parent.parent
      }
      checkNotNull(parent) {
        "View " + viewGroup + " has not been mounted under" +
          " ReactRootView"
      }
      return parent as ViewGroup
    }
  }

  init {
    UiThreadUtil.assertOnUiThread()
    val wrappedViewTag = wrappedView.id
    check(wrappedViewTag >= 1) { "Expect view tag to be set for $wrappedView" }
    val module = context.getNativeModule(RNGestureHandlerModule::class.java)
    val registry = module!!.registry
    rootView = findRootViewTag(wrappedView)
    Log.i(
      ReactConstants.TAG,
      "[GESTURE HANDLER] Initialize gesture handler for root view " + rootView)
    mContext = context
    mOrchestrator = GestureHandlerOrchestrator(
      wrappedView, registry, RNViewConfigurationHelper())
    mOrchestrator.setMinimumAlphaForTraversal(MIN_ALPHA_FOR_TOUCH)
    mJSGestureHandler = RootViewGestureHandler()
    mJSGestureHandler.tag = -wrappedViewTag
    registry.registerHandler(mJSGestureHandler)
    registry.attachHandlerToView(mJSGestureHandler.tag, wrappedViewTag)
    module.registerRootHelper(this)
  }
}