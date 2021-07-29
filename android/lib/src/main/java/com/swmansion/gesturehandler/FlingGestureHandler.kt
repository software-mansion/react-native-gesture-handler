package com.swmansion.gesturehandler

import android.os.Handler
import android.view.MotionEvent

class FlingGestureHandler : GestureHandler<FlingGestureHandler>() {
  private val maxDurationMs = DEFAULT_MAX_DURATION_MS
  private val minAcceptableDelta = DEFAULT_MIN_ACCEPTABLE_DELTA
  private var direction = DEFAULT_DIRECTION
  private var numberOfPointersRequired = DEFAULT_NUMBER_OF_TOUCHES_REQUIRED
  private var startX = 0f
  private var startY = 0f
  private var mHandler: Handler? = null
  private var maxNumberOfPointersSimultaneously = 0
  private val failDelayed = Runnable { fail() }
  override fun resetConfig() {
    super.resetConfig()
    numberOfPointersRequired = DEFAULT_NUMBER_OF_TOUCHES_REQUIRED
    direction = DEFAULT_DIRECTION
  }

  fun setNumberOfPointersRequired(numberOfPointersRequired: Int) {
    this.numberOfPointersRequired = numberOfPointersRequired
  }

  fun setDirection(direction: Int) {
    this.direction = direction
  }

  private fun startFling(event: MotionEvent) {
    startX = event.rawX
    startY = event.rawY
    begin()
    maxNumberOfPointersSimultaneously = 1
    if (mHandler == null) {
      mHandler = Handler() // lazy delegate?
    } else {
      mHandler!!.removeCallbacksAndMessages(null)
    }
    mHandler!!.postDelayed(failDelayed, maxDurationMs)
  }

  private fun tryEndFling(event: MotionEvent): Boolean {
    return if (
      maxNumberOfPointersSimultaneously == numberOfPointersRequired &&
      (direction and DIRECTION_RIGHT != 0 &&
        event.rawX - startX > minAcceptableDelta ||
        direction and DIRECTION_LEFT != 0 &&
        startX - event.rawX > minAcceptableDelta ||
        direction and DIRECTION_UP != 0 &&
        startY - event.rawY > minAcceptableDelta ||
        direction and DIRECTION_DOWN != 0 &&
        event.rawY - startY > minAcceptableDelta)) {
      mHandler!!.removeCallbacksAndMessages(null)
      activate()
      end()
      true
    } else {
      false
    }
  }

  private fun endFling(event: MotionEvent) {
    if (!tryEndFling(event)) {
      fail()
    }
  }

  override fun onHandle(event: MotionEvent) {
    val state = state
    if (state == STATE_UNDETERMINED) {
      startFling(event)
    }
    if (state == STATE_BEGAN) {
      tryEndFling(event)
      if (event.pointerCount > maxNumberOfPointersSimultaneously) {
        maxNumberOfPointersSimultaneously = event.pointerCount
      }
      val action = event.actionMasked
      if (action == MotionEvent.ACTION_UP) {
        endFling(event)
      }
    }
  }

  override fun onCancel() {
    mHandler?.removeCallbacksAndMessages(null)
  }

  override fun onReset() {
    mHandler?.removeCallbacksAndMessages(null)
  }

  companion object {
    private const val DEFAULT_MAX_DURATION_MS: Long = 800
    private const val DEFAULT_MIN_ACCEPTABLE_DELTA: Long = 160
    private const val DEFAULT_DIRECTION = DIRECTION_RIGHT
    private const val DEFAULT_NUMBER_OF_TOUCHES_REQUIRED = 1
  }
}
