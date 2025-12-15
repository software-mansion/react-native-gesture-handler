package com.swmansion.gesturehandler.core

import android.content.Context
import android.os.Handler
import android.os.Looper
import android.view.MotionEvent
import com.facebook.react.bridge.ReadableMap
import com.swmansion.gesturehandler.react.eventbuilders.ScrollGestureHandlerEventDataBuilder

class ScrollGestureHandler(context: Context?) : GestureHandler() {
  // Accumulated scroll values
  var scrollX = 0f
    private set
  var scrollY = 0f
    private set

  // Per-event scroll deltas (from the last scroll event)
  var deltaX = 0f
    private set
  var deltaY = 0f
    private set

  // Position tracking for scroll events (since they bypass normal handle method)
  var lastScrollPositionX = 0f
    private set
  var lastScrollPositionY = 0f
    private set
  var lastScrollAbsoluteX = 0f
    private set
  var lastScrollAbsoluteY = 0f
    private set

  // Handler for scroll end timeout
  private val handler = Handler(Looper.getMainLooper())
  private val scrollEndRunnable = Runnable {
    if (state == STATE_ACTIVE) {
      end()
    }
  }

  override fun resetConfig() {
    super.resetConfig()
  }

  override fun onReset() {
    scrollX = 0f
    scrollY = 0f
    deltaX = 0f
    deltaY = 0f
    lastScrollPositionX = 0f
    lastScrollPositionY = 0f
    lastScrollAbsoluteX = 0f
    lastScrollAbsoluteY = 0f
    handler.removeCallbacks(scrollEndRunnable)
  }

  override fun resetProgress() {
    scrollX = 0f
    scrollY = 0f
    deltaX = 0f
    deltaY = 0f
  }

  fun handleScrollEvent(event: MotionEvent, sourceEvent: MotionEvent) {
    if (!isEnabled ||
      state == STATE_CANCELLED ||
      state == STATE_FAILED ||
      state == STATE_END
    ) {
      return
    }

    // Cancel any pending scroll end timeout
    handler.removeCallbacks(scrollEndRunnable)

    // Update position from the event (since scroll events bypass normal handle method)
    lastScrollPositionX = event.x
    lastScrollPositionY = event.y
    lastScrollAbsoluteX = sourceEvent.rawX
    lastScrollAbsoluteY = sourceEvent.rawY

    // Cancel the gesture if the pointer is outside the view bounds
    if (!isWithinBounds(view, event.x, event.y)) {
      if (state == STATE_ACTIVE) {
        cancel()
      } else if (state == STATE_BEGAN) {
        fail()
      }
      return
    }

    // AXIS_HSCROLL and AXIS_VSCROLL give the scroll delta
    // Positive AXIS_VSCROLL means scrolling up/away from user
    // Positive AXIS_HSCROLL means scrolling right
    val hScroll = sourceEvent.getAxisValue(MotionEvent.AXIS_HSCROLL)
    val vScroll = sourceEvent.getAxisValue(MotionEvent.AXIS_VSCROLL)

    // Store per-event deltas
    deltaX = hScroll
    deltaY = vScroll

    // Accumulate total scroll
    scrollX += hScroll
    scrollY += vScroll

    when (state) {
      STATE_UNDETERMINED -> {
        begin()
        activate()
      }
      STATE_ACTIVE -> {
        // Handler is already active, just update values
      }
    }

    // Schedule scroll end after timeout (no more scroll events received)
    handler.postDelayed(scrollEndRunnable, SCROLL_END_TIMEOUT_MS)
  }

  override fun onHandle(event: MotionEvent, sourceEvent: MotionEvent) {
    // Regular touch events are not handled by this gesture.
    // Only fail if we've already begun - if we're still in UNDETERMINED state,
    // there's nothing to fail and calling fail() would send a spurious state
    // change event to JS causing onFinalize to be called without onBegin.
    if (state != STATE_UNDETERMINED) {
      fail()
    }
  }

  override fun onHandleScroll(event: MotionEvent, sourceEvent: MotionEvent) {
    handleScrollEvent(event, sourceEvent)
  }

  class Factory : GestureHandler.Factory<ScrollGestureHandler>() {
    override val type = ScrollGestureHandler::class.java
    override val name = "ScrollGestureHandler"

    override fun create(context: Context?): ScrollGestureHandler = ScrollGestureHandler(context)

    override fun setConfig(handler: ScrollGestureHandler, config: ReadableMap) {
      super.setConfig(handler, config)
    }

    override fun createEventBuilder(handler: ScrollGestureHandler) = ScrollGestureHandlerEventDataBuilder(handler)
  }

  companion object {
    // Time in ms to wait after the last scroll event before ending the gesture
    private const val SCROLL_END_TIMEOUT_MS = 150L
  }
}
