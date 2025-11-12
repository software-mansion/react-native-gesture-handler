package com.swmansion.gesturehandler.react

import android.os.SystemClock
import android.util.Log
import android.view.MotionEvent
import android.view.View
import android.view.ViewGroup
import android.view.ViewParent
import com.facebook.react.bridge.ReactContext
import com.facebook.react.bridge.UiThreadUtil
import com.facebook.react.common.ReactConstants
import com.facebook.react.uimanager.RootView
import com.facebook.react.uimanager.ThemedReactContext
import com.swmansion.gesturehandler.core.GestureHandler
import com.swmansion.gesturehandler.core.GestureHandlerOrchestrator

class RNGestureHandlerRootHelper(private val context: ReactContext, wrappedView: ViewGroup) {
  private val orchestrator: GestureHandlerOrchestrator?
  private val jsGestureHandler: GestureHandler?
  val rootView: ViewGroup
  private var shouldIntercept = false
  private var passingTouch = false

  init {
    UiThreadUtil.assertOnUiThread()
    val wrappedViewTag = wrappedView.id
    assert(wrappedViewTag >= 1) { "Expect view tag to be set for $wrappedView" }
    val module = context.getNativeModule(RNGestureHandlerModule::class.java)!!
    val registry = module.registry
    rootView = findRootViewTag(wrappedView)
    Log.i(
      ReactConstants.TAG,
      "[GESTURE HANDLER] Initialize gesture handler for root view $rootView",
    )
    orchestrator = GestureHandlerOrchestrator(
      wrappedView,
      registry,
      RNViewConfigurationHelper(),
      rootView,
    ).apply {
      minimumAlphaForTraversal = MIN_ALPHA_FOR_TOUCH
    }
    jsGestureHandler = RootViewGestureHandler(handlerTag = -wrappedViewTag)
    registry.registerHandler(jsGestureHandler)
    registry.attachHandlerToView(jsGestureHandler.tag, wrappedViewTag, GestureHandler.ACTION_TYPE_JS_FUNCTION_OLD_API)
    module.registerRootHelper(this)
  }

  fun tearDown() {
    Log.i(
      ReactConstants.TAG,
      "[GESTURE HANDLER] Tearing down gesture handler registered for root view $rootView",
    )
    val module = (context as ThemedReactContext).reactApplicationContext.getNativeModule(
      RNGestureHandlerModule::class.java,
    )!!
    with(module) {
      registry.dropHandler(jsGestureHandler!!.tag)
      unregisterRootHelper(this@RNGestureHandlerRootHelper)
    }
  }

  internal inner class RootViewGestureHandler(handlerTag: Int) : GestureHandler() {
    init {
      this.tag = handlerTag
    }

    private fun handleEvent(event: MotionEvent) {
      val currentState = state

      // we shouldn't stop intercepting events when there is an active handler already, which could happen when
      // adding a new pointer to the screen after a handler activates
      if (currentState == STATE_UNDETERMINED &&
        (!shouldIntercept || orchestrator?.isAnyHandlerActive() != true)
      ) {
        begin()
        shouldIntercept = false
      }

      if (event.actionMasked == MotionEvent.ACTION_UP ||
        event.actionMasked == MotionEvent.ACTION_HOVER_EXIT
      ) {
        end()
      }
    }

    override fun onHandle(event: MotionEvent, sourceEvent: MotionEvent) = handleEvent(event)

    override fun onHandleHover(event: MotionEvent, sourceEvent: MotionEvent) = handleEvent(event)

    override fun onCancel() {
      shouldIntercept = true
      val time = SystemClock.uptimeMillis()
      val event = MotionEvent.obtain(time, time, MotionEvent.ACTION_CANCEL, 0f, 0f, 0).apply {
        action = MotionEvent.ACTION_CANCEL
      }
      if (rootView is RootView) {
        rootView.onChildStartedNativeGesture(rootView, event)
      }
      event.recycle()
    }
  }

  fun requestDisallowInterceptTouchEvent() {
    // If this method gets called it means that some native view is attempting to grab lock for
    // touch event delivery. In that case we cancel all gesture recognizers
    if (orchestrator != null && !passingTouch) {
      // if we are in the process of delivering touch events via GH orchestrator, we don't want to
      // treat it as a native gesture capturing the lock
      tryCancelAllHandlers()
    }
  }

  fun dispatchTouchEvent(event: MotionEvent): Boolean {
    // We mark `mPassingTouch` before we get into `mOrchestrator.onTouchEvent` so that we can tell
    // if `requestDisallow` has been called as a result of a normal gesture handling process or
    // as a result of one of the gesture handlers activating
    passingTouch = true
    orchestrator!!.onTouchEvent(event)
    passingTouch = false
    return shouldIntercept
  }

  private fun tryCancelAllHandlers() {
    // In order to cancel handlers we activate handler that is hooked to the root view
    jsGestureHandler?.apply {
      if (state == GestureHandler.STATE_BEGAN) {
        // Try activate main JS handler
        activate()
        end()
      }
    }
  }

  /*package*/
  // We want to keep order of parameters, so instead of removing viewTag we suppress the warning
  @Suppress("UNUSED_PARAMETER", "COMMENT_IN_SUPPRESSION")
  fun handleSetJSResponder(viewTag: Int, blockNativeResponder: Boolean) {
    if (blockNativeResponder) {
      UiThreadUtil.runOnUiThread { tryCancelAllHandlers() }
    }
  }

  fun activateNativeHandlers(view: View) {
    orchestrator?.activateNativeHandlersForView(view)
  }

  companion object {
    private const val MIN_ALPHA_FOR_TOUCH = 0.1f
    private fun findRootViewTag(viewGroup: ViewGroup): ViewGroup {
      UiThreadUtil.assertOnUiThread()
      var parent: ViewParent? = viewGroup
      while (parent != null && parent !is RootView) {
        parent = parent.parent
      }
      checkNotNull(parent) {
        "View $viewGroup has not been mounted under ReactRootView"
      }
      return parent as ViewGroup
    }
  }
}
