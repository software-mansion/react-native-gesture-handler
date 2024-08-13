package com.swmansion.gesturehandler.core

import android.content.Context
import android.os.Handler
import android.os.Looper
import android.os.SystemClock
import android.view.MotionEvent

class LongPressGestureHandler(context: Context) : GestureHandler<LongPressGestureHandler>() {
  var minDurationMs = DEFAULT_MIN_DURATION_MS
  val duration: Int
    get() = (previousTime - startTime).toInt()
  private val defaultMaxDistSq: Float
  private var maxDistSq: Float
  private var numberOfPointersRequired: Int
  private var startX = 0f
  private var startY = 0f
  private var startTime: Long = 0
  private var previousTime: Long = 0
  private var handler: Handler? = null

  init {
    setShouldCancelWhenOutside(true)

    val defaultMaxDist = DEFAULT_MAX_DIST_DP * context.resources.displayMetrics.density
    defaultMaxDistSq = defaultMaxDist * defaultMaxDist
    maxDistSq = defaultMaxDistSq
    numberOfPointersRequired = 1
  }

  override fun resetConfig() {
    super.resetConfig()
    minDurationMs = DEFAULT_MIN_DURATION_MS
    maxDistSq = defaultMaxDistSq
  }

  fun setMaxDist(maxDist: Float): LongPressGestureHandler {
    maxDistSq = maxDist * maxDist
    return this
  }

  fun setNumberOfPointers(numberOfPointers: Int): LongPressGestureHandler {
    numberOfPointersRequired = numberOfPointers
    return this
  }

  override fun onHandle(event: MotionEvent, sourceEvent: MotionEvent) {
    if (!shouldActivateWithMouse(sourceEvent)) {
      return
    }

    if (state == STATE_UNDETERMINED) {
      previousTime = SystemClock.uptimeMillis()
      startTime = previousTime
      begin()
      startX = sourceEvent.rawX
      startY = sourceEvent.rawY
    }

    if (state == STATE_BEGAN && sourceEvent.pointerCount == numberOfPointersRequired) {
      handler = Handler(Looper.getMainLooper())
      if (minDurationMs > 0) {
        handler!!.postDelayed({ activate() }, minDurationMs)
      } else if (minDurationMs == 0L) {
        activate()
      }
    }
    if (sourceEvent.actionMasked == MotionEvent.ACTION_UP || sourceEvent.actionMasked == MotionEvent.ACTION_BUTTON_RELEASE) {
      handler?.let {
        it.removeCallbacksAndMessages(null)
        handler = null
      }
      if (state == STATE_ACTIVE) {
        end()
      } else {
        fail()
      }
    }
    // Even though action suggests that pointer was lifted, it is still counted in pointerCount. That's why we subtract 1
    else if (sourceEvent.actionMasked == MotionEvent.ACTION_POINTER_UP && sourceEvent.pointerCount - 1 < numberOfPointersRequired && state != STATE_ACTIVE) {
      fail()
    } else {
      // calculate distance from start
      val deltaX = sourceEvent.rawX - startX
      val deltaY = sourceEvent.rawY - startY
      val distSq = deltaX * deltaX + deltaY * deltaY
      if (distSq > maxDistSq) {
        if (state == STATE_ACTIVE) {
          cancel()
        } else {
          fail()
        }
      }
    }
  }

  override fun onStateChange(newState: Int, previousState: Int) {
    handler?.let {
      it.removeCallbacksAndMessages(null)
      handler = null
    }
  }

  override fun dispatchStateChange(newState: Int, prevState: Int) {
    previousTime = SystemClock.uptimeMillis()
    super.dispatchStateChange(newState, prevState)
  }

  override fun dispatchHandlerUpdate(event: MotionEvent) {
    previousTime = SystemClock.uptimeMillis()
    super.dispatchHandlerUpdate(event)
  }

  companion object {
    private const val DEFAULT_MIN_DURATION_MS: Long = 500
    private const val DEFAULT_MAX_DIST_DP = 10f
  }
}
