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
import com.swmansion.gesturehandler.core.OnJSResponderCancelListener

class RNGestureHandlerRootHelper(private val context: ReactContext, wrappedView: ViewGroup, private val moduleId: Int) {
  val orchestrator: GestureHandlerOrchestrator?
  private val jsGestureHandler: GestureHandler?
  val rootView: ViewGroup
  private var shouldIntercept = false
  private var wasIntercepting = false
  private var passingTouch = false
  private var passingNativeTouch = false
  private var nativeTouchGrabRequested = false

  init {
    val registry =
      RNGestureHandlerModule.registries[moduleId] ?: throw Exception("Tried to access a non-existent registry")

    UiThreadUtil.assertOnUiThread()
    val wrappedViewTag = wrappedView.id
    assert(wrappedViewTag >= 1) { "Expect view tag to be set for $wrappedView" }
    val module = context.getNativeModule(RNGestureHandlerModule::class.java)!!
    rootView = findRootViewTag(wrappedView)
    Log.i(
      ReactConstants.TAG,
      "[GESTURE HANDLER] Initialize gesture handler for root view $rootView",
    )
    val onJSResponderCancelListener = object : OnJSResponderCancelListener {
      override fun onCancelJSResponderRequested(handler: GestureHandler) {
        val time = SystemClock.uptimeMillis()
        val event = MotionEvent.obtain(time, time, MotionEvent.ACTION_CANCEL, 0f, 0f, 0)
        if (rootView is RootView) {
          rootView.onChildStartedNativeGesture(rootView, event)
        }
        event.recycle()
      }
    }
    orchestrator = GestureHandlerOrchestrator(
      wrappedView,
      registry,
      RNViewConfigurationHelper(),
      rootView,
      onJSResponderCancelListener,
    ).apply {
      minimumAlphaForTraversal = MIN_ALPHA_FOR_TOUCH
    }
    jsGestureHandler = RootViewGestureHandler(handlerTag = -wrappedViewTag)
    registry.registerHandler(jsGestureHandler)
    registry.attachHandlerToView(jsGestureHandler.tag, wrappedViewTag, GestureHandler.ACTION_TYPE_NONE)
    module.registerRootHelper(this)
  }

  fun tearDown() {
    val registry =
      RNGestureHandlerModule.registries[moduleId] ?: throw Exception("Tried to access a non-existent registry")

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
    override val isContinuous = true

    init {
      this.tag = handlerTag
      this.cancelsJSResponder = false
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
    }
  }

  fun requestDisallowInterceptTouchEvent() {
    // If this method gets called it means that some native view is attempting to grab lock for
    // touch event delivery. Legacy handlers are cancelled right away; handlers opting into
    // native-touch-grab cancellation are deferred to `onNativeDispatchEnd`.
    if (orchestrator != null && !passingTouch) {
      // if we are in the process of delivering touch events via GH orchestrator, we don't want to
      // treat it as a native gesture capturing the lock
      if (passingNativeTouch) {
        // Requests may also arrive outside any dispatch pass (e.g. RN's JS responder). Those have
        // no pass to classify against and must not arm the sweep for a future gesture.
        nativeTouchGrabRequested = true
      }
      orchestrator.cancelAllLegacyHandlers()
    }
  }

  fun onNativeDispatchStart() {
    passingNativeTouch = true
  }

  /**
   * Deferred handling of a disallow-intercept request recorded during this dispatch pass. The
   * request alone doesn't say what the caller did with the event: a scrollable calls it when it
   * takes over the touch, but e.g. a nested pager calls it already on DOWN, just to keep its
   * ancestors from stealing a swipe it may recognize later, and the event still reaches the
   * button - at request time both calls look identical. They only become
   * distinguishable once the native dispatch completes (did the button receive the DOWN?), which
   * is why cancellation runs here instead of in `requestDisallowInterceptTouchEvent`.
   */
  fun onNativeDispatchEnd(event: MotionEvent) {
    passingNativeTouch = false

    if (nativeTouchGrabRequested) {
      nativeTouchGrabRequested = false

      val grabbedMidGesture = event.actionMasked != MotionEvent.ACTION_DOWN &&
        event.actionMasked != MotionEvent.ACTION_POINTER_DOWN

      orchestrator?.cancelHandlersOnNativeTouchGrab(grabbedMidGesture)
    }
  }

  fun dispatchTouchEvent(event: MotionEvent): Boolean {
    // We mark `mPassingTouch` before we get into `mOrchestrator.onTouchEvent` so that we can tell
    // if `requestDisallow` has been called as a result of a normal gesture handling process or
    // as a result of one of the gesture handlers activating
    passingTouch = true
    orchestrator!!.onTouchEvent(event)
    passingTouch = false

    // On the transition into interception, cancel the native views the pointers landed on - the
    // framework's ACTION_CANCEL never reaches them since RNGH ignores `onInterceptTouchEvent`
    if (shouldIntercept && !wasIntercepting) {
      orchestrator!!.cancelTouchesInInterceptedViews(event)
    }
    wasIntercepting = shouldIntercept

    return shouldIntercept
  }

  fun activateNativeHandlers(view: View) {
    orchestrator?.activateNativeHandlersForView(view)
  }

  fun recordHandlerIfNotPresent(handler: GestureHandler) {
    orchestrator?.recordHandlerIfNotPresent(handler, null)
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
