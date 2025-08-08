package com.swmansion.gesturehandler.core

import android.content.Context
import android.os.SystemClock
import android.view.MotionEvent
import android.view.View
import android.view.ViewConfiguration
import android.view.ViewGroup
import android.widget.ScrollView
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.views.scroll.ReactHorizontalScrollView
import com.facebook.react.views.scroll.ReactScrollView
import com.facebook.react.views.swiperefresh.ReactSwipeRefreshLayout
import com.facebook.react.views.text.ReactTextView
import com.facebook.react.views.textinput.ReactEditText
import com.facebook.react.views.view.ReactViewGroup
import com.swmansion.gesturehandler.react.RNGestureHandlerButtonViewManager
import com.swmansion.gesturehandler.react.eventbuilders.NativeGestureHandlerEventDataBuilder
import com.swmansion.gesturehandler.react.isScreenReaderOn

class NativeViewGestureHandler : GestureHandler() {
  private var shouldActivateOnStart = false

  /**
   * Set this to `true` when wrapping native components that are supposed to be an exclusive
   * target for a touch stream. Like for example switch or slider component which when activated
   * aren't supposed to be cancelled by scrollview or other container that may also handle touches.
   */
  var disallowInterruption = false
    private set

  private var hook: NativeViewGestureHandlerHook = defaultHook

  init {
    shouldCancelWhenOutside = true
  }

  override fun resetConfig() {
    super.resetConfig()
    shouldActivateOnStart = DEFAULT_SHOULD_ACTIVATE_ON_START
    disallowInterruption = DEFAULT_DISALLOW_INTERRUPTION
    shouldCancelWhenOutside = DEFAULT_SHOULD_CANCEL_WHEN_OUTSIDE
  }

  override fun shouldRecognizeSimultaneously(handler: GestureHandler): Boolean {
    // if the gesture is marked by user as simultaneous with other or the hook return true
    hook.shouldRecognizeSimultaneously(handler)?.let {
      return@shouldRecognizeSimultaneously it
    }

    if (super.shouldRecognizeSimultaneously(handler)) {
      return true
    }

    if (handler is NativeViewGestureHandler) {
      // Special case when the peer handler is also an instance of NativeViewGestureHandler:
      // For the `disallowInterruption` to work correctly we need to check the property when
      // accessed as a peer, because simultaneous recognizers can be set on either side of the
      // connection.
      if (handler.state == STATE_ACTIVE && handler.disallowInterruption) {
        // other handler is active and it disallows interruption, we don't want to get into its way
        return false
      }
    }
    val canBeInterrupted = !disallowInterruption
    val otherState = handler.state
    return if (state == STATE_ACTIVE && otherState == STATE_ACTIVE && canBeInterrupted) {
      // if both handlers are active and the current handler can be interrupted it we return `false`
      // as it means the other handler has turned active and returning `true` would prevent it from
      // interrupting the current handler
      false
    } else {
      state == STATE_ACTIVE &&
        canBeInterrupted &&
        (!hook.shouldCancelRootViewGestureHandlerIfNecessary() || handler.tag > 0)
    }
    // otherwise we can only return `true` if already in an active state
  }

  override fun shouldBeCancelledBy(handler: GestureHandler): Boolean = !disallowInterruption

  override fun onPrepare() {
    when (val view = view) {
      is NativeViewGestureHandlerHook -> this.hook = view
      is ReactEditText -> this.hook = EditTextHook(this, view)
      is ReactSwipeRefreshLayout -> this.hook = SwipeRefreshLayoutHook(this, view)
      is ReactScrollView -> this.hook = ScrollViewHook()
      is ReactHorizontalScrollView -> this.hook = ScrollViewHook()
      is ReactTextView -> this.hook = TextViewHook()
      is ReactViewGroup -> this.hook = ReactViewGroupHook()
    }
  }

  override fun onHandle(event: MotionEvent, sourceEvent: MotionEvent) {
    val view = view!!

    val isTouchExplorationEnabled = view.context.isScreenReaderOn()

    if (view is RNGestureHandlerButtonViewManager.ButtonViewGroup && isTouchExplorationEnabled) {
      // Fix for: https://github.com/software-mansion/react-native-gesture-handler/issues/2808
      // When TalkBack is enabled, events are often not being sent to the orchestrator for processing.
      // Instead, states will be changed directly by an alternative mechanism added in this PR:
      // https://github.com/software-mansion/react-native-gesture-handler/pull/2234
      return
    }

    if (event.actionMasked == MotionEvent.ACTION_UP) {
      if (state == STATE_UNDETERMINED && !hook.canBegin(event)) {
        cancel()
      } else {
        hook.sendTouchEvent(view, event)

        if ((state == STATE_UNDETERMINED || state == STATE_BEGAN) && hook.canActivate(view)) {
          activate()
        }

        if (state == STATE_UNDETERMINED) {
          cancel()
        } else {
          end()
        }
      }

      hook.afterGestureEnd(event)
    } else if (state == STATE_UNDETERMINED || state == STATE_BEGAN) {
      when {
        shouldActivateOnStart -> {
          tryIntercept(view, event)
          hook.sendTouchEvent(view, event)
          activate()
        }

        tryIntercept(view, event) -> {
          hook.sendTouchEvent(view, event)
          activate()
        }

        hook.wantsToHandleEventBeforeActivation() -> {
          hook.handleEventBeforeActivation(event)
        }

        state != STATE_BEGAN -> {
          if (hook.canBegin(event)) {
            begin()
          }
        }
      }
    } else if (state == STATE_ACTIVE) {
      hook.sendTouchEvent(view, event)
    }
  }

  private fun dispatchCancelEventToView() {
    val time = SystemClock.uptimeMillis()
    val event = MotionEvent.obtain(time, time, MotionEvent.ACTION_CANCEL, 0f, 0f, 0).apply {
      action = MotionEvent.ACTION_CANCEL
    }
    hook.sendTouchEvent(view, event)
    event.recycle()
  }

  override fun onCancel() = dispatchCancelEventToView()

  override fun onFail() = dispatchCancelEventToView()

  override fun onReset() {
    this.hook = defaultHook
  }

  override fun wantsToAttachDirectlyToView() = true

  class Factory : GestureHandler.Factory<NativeViewGestureHandler>() {
    override val type = NativeViewGestureHandler::class.java
    override val name = "NativeViewGestureHandler"

    override fun create(context: Context?): NativeViewGestureHandler = NativeViewGestureHandler()

    override fun updateConfig(handler: NativeViewGestureHandler, config: ReadableMap) {
      super.updateConfig(handler, config)
      if (config.hasKey(KEY_SHOULD_ACTIVATE_ON_START)) {
        handler.shouldActivateOnStart = config.getBoolean(KEY_SHOULD_ACTIVATE_ON_START)
      }
      if (config.hasKey(KEY_DISALLOW_INTERRUPTION)) {
        handler.disallowInterruption = config.getBoolean(KEY_DISALLOW_INTERRUPTION)
      }
    }

    override fun createEventBuilder(handler: NativeViewGestureHandler) = NativeGestureHandlerEventDataBuilder(handler)

    companion object {
      private const val KEY_SHOULD_ACTIVATE_ON_START = "shouldActivateOnStart"
      private const val KEY_DISALLOW_INTERRUPTION = "disallowInterruption"
    }
  }

  companion object {
    private const val DEFAULT_SHOULD_CANCEL_WHEN_OUTSIDE = true
    private const val DEFAULT_SHOULD_ACTIVATE_ON_START = false
    private const val DEFAULT_DISALLOW_INTERRUPTION = false

    private fun tryIntercept(view: View, event: MotionEvent) = view is ViewGroup && view.onInterceptTouchEvent(event)

    private val defaultHook = object : NativeViewGestureHandlerHook {}
  }

  interface NativeViewGestureHandlerHook {
    /**
     * Called when gesture is in the UNDETERMINED state, shouldActivateOnStart is set to false,
     * and both tryIntercept and wantsToHandleEventBeforeActivation returned false.
     *
     * @return Boolean value signalling whether the handler can transition to the BEGAN state. If false
     * the gesture will be cancelled.
     */
    fun canBegin(event: MotionEvent) = true

    /**
     * Checks whether handler can activate. Used by TextViewHook.
     */
    fun canActivate(view: View) = view.isPressed

    /**
     * Called after the gesture transitions to the END state.
     */
    fun afterGestureEnd(event: MotionEvent) = Unit

    /**
     * @return Boolean value signalling whether the gesture can be recognized simultaneously with
     * other (handler). Returning false doesn't necessarily prevent it from happening.
     */
    fun shouldRecognizeSimultaneously(handler: GestureHandler): Boolean? = null

    /**
     * shouldActivateOnStart and tryIntercept have priority over this method
     *
     * @return Boolean value signalling if the hook wants to handle events passed to the handler
     * before it activates (after that the events are passed to the underlying view).
     */
    fun wantsToHandleEventBeforeActivation() = false

    /**
     * Will be called with events if wantsToHandleEventBeforeActivation returns true.
     */
    fun handleEventBeforeActivation(event: MotionEvent) = Unit

    /**
     * @return Boolean value indicating whether the RootViewGestureHandler should be cancelled
     * by this one.
     */
    fun shouldCancelRootViewGestureHandlerIfNecessary() = false

    /**
     * Passes the event down to the underlying view using the correct method.
     */
    fun sendTouchEvent(view: View?, event: MotionEvent) = view?.onTouchEvent(event)
  }

  private class TextViewHook : NativeViewGestureHandlerHook {
    override fun shouldRecognizeSimultaneously(handler: GestureHandler) = false

    // We have to explicitly check for ReactTextView, since its `isPressed` flag is not set to `true`,
    // in contrast to e.g. Touchable
    override fun canActivate(view: View) = view is ReactTextView
  }

  private class EditTextHook(private val handler: NativeViewGestureHandler, private val editText: ReactEditText) :
    NativeViewGestureHandlerHook {
    private var startX = 0f
    private var startY = 0f
    private var touchSlopSquared: Int

    init {
      val vc = ViewConfiguration.get(editText.context)
      touchSlopSquared = vc.scaledTouchSlop * vc.scaledTouchSlop
    }

    override fun afterGestureEnd(event: MotionEvent) {
      if (
        (event.x - startX) * (event.x - startX) + (event.y - startY) * (event.y - startY) < touchSlopSquared
      ) {
        editText.requestFocusFromJS()
      }
    }

    // recognize alongside every handler besides RootViewGestureHandler, which is a private inner class
    // of RNGestureHandlerRootHelper so no explicit type checks, but its tag is always negative
    // also if other handler is NativeViewGestureHandler then don't override the default implementation
    override fun shouldRecognizeSimultaneously(handler: GestureHandler) =
      handler.tag > 0 && handler !is NativeViewGestureHandler

    override fun wantsToHandleEventBeforeActivation() = true

    override fun handleEventBeforeActivation(event: MotionEvent) {
      handler.activate()
      editText.onTouchEvent(event)

      startX = event.x
      startY = event.y
    }

    override fun shouldCancelRootViewGestureHandlerIfNecessary() = true
  }

  private class SwipeRefreshLayoutHook(
    private val handler: NativeViewGestureHandler,
    private val swipeRefreshLayout: ReactSwipeRefreshLayout,
  ) : NativeViewGestureHandlerHook {
    override fun wantsToHandleEventBeforeActivation() = true

    override fun handleEventBeforeActivation(event: MotionEvent) {
      // RefreshControl from GH is set up in a way that ScrollView wrapped with it should wait for
      // it to fail. This way the RefreshControl is not canceled by the scroll handler.
      // The problem with this approach is that the RefreshControl handler stays active all the time
      // preventing scroll from activating.
      // This is a workaround to prevent it from happening.

      // First get the ScrollView under the RefreshControl, if there is none, return.
      val scroll = swipeRefreshLayout.getChildAt(0) as? ScrollView ?: return

      // Then find the first NativeViewGestureHandler attached to it
      val scrollHandler = handler.orchestrator
        ?.getHandlersForView(scroll)
        ?.first {
          it is NativeViewGestureHandler
        }

      // If handler was found, it's active and the ScrollView is not at the top, fail the RefreshControl
      if (scrollHandler != null && scrollHandler.state == STATE_ACTIVE && scroll.scrollY > 0) {
        handler.fail()
      }

      // The drawback is that the smooth transition from scrolling to refreshing in a single swipe
      // is impossible this way and two swipes are required:
      // - one to go back to top
      // - one to actually refresh
      // oh well  ¯\_(ツ)_/¯
    }
  }

  private class ScrollViewHook : NativeViewGestureHandlerHook {
    override fun shouldCancelRootViewGestureHandlerIfNecessary() = true
  }

  private class ReactViewGroupHook : NativeViewGestureHandlerHook {
    // There are cases where a native component is wrapped with a `ReactViewGroup` (the component is rendered
    // inside a `<View />` component in JS). In such cases, calling `onTouchEvent` wouldn't work as those are
    // ignored by the wrapper view. Instead `dispatchTouchEvent` can be used, which causes the view to dispatch
    // the event to its children.
    override fun sendTouchEvent(view: View?, event: MotionEvent) = view?.dispatchTouchEvent(event)
  }
}
