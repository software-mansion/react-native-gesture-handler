package com.swmansion.gesturehandler

import android.os.Handler
import android.view.MotionEvent

class FlingGestureHandler : GestureHandler<FlingGestureHandler>() {
  private val mMaxDurationMs = DEFAULT_MAX_DURATION_MS
  private val mMinAcceptableDelta = DEFAULT_MIN_ACCEPTABLE_DELTA
  private var mDirection = DEFAULT_DIRECTION
  private var mNumberOfPointersRequired = DEFAULT_NUMBER_OF_TOUCHES_REQUIRED
  private var mStartX = 0f
  private var mStartY = 0f
  private var mHandler: Handler? = null
  private var mMaxNumberOfPointersSimultaneously = 0
  private val mFailDelayed = Runnable { fail() }
  override fun resetConfig() {
    super.resetConfig()
    mNumberOfPointersRequired = DEFAULT_NUMBER_OF_TOUCHES_REQUIRED
    mDirection = DEFAULT_DIRECTION
  }

  fun setNumberOfPointersRequired(numberOfPointersRequired: Int) {
    mNumberOfPointersRequired = numberOfPointersRequired
  }

  fun setDirection(direction: Int) {
    mDirection = direction
  }

  private fun startFling(event: MotionEvent) {
    mStartX = event.rawX
    mStartY = event.rawY
    begin()
    mMaxNumberOfPointersSimultaneously = 1
    if (mHandler == null) {
      mHandler = Handler()
    } else {
      mHandler!!.removeCallbacksAndMessages(null)
    }
    mHandler!!.postDelayed(mFailDelayed, mMaxDurationMs)
  }

  private fun tryEndFling(event: MotionEvent): Boolean {
    return if (mMaxNumberOfPointersSimultaneously == mNumberOfPointersRequired &&
      (mDirection and DIRECTION_RIGHT != 0 &&
        event.rawX - mStartX > mMinAcceptableDelta ||
        mDirection and DIRECTION_LEFT != 0 &&
        mStartX - event.rawX > mMinAcceptableDelta ||
        mDirection and DIRECTION_UP != 0 &&
        mStartY - event.rawY > mMinAcceptableDelta ||
        mDirection and DIRECTION_DOWN != 0 &&
        event.rawY - mStartY > mMinAcceptableDelta)) {
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
      if (event.pointerCount > mMaxNumberOfPointersSimultaneously) {
        mMaxNumberOfPointersSimultaneously = event.pointerCount
      }
      val action = event.actionMasked
      if (action == MotionEvent.ACTION_UP) {
        endFling(event)
      }
    }
  }

  override fun onCancel() {
    if (mHandler != null) {
      mHandler!!.removeCallbacksAndMessages(null)
    }
  }

  override fun onReset() {
    if (mHandler != null) {
      mHandler!!.removeCallbacksAndMessages(null)
    }
  }

  companion object {
    private const val DEFAULT_MAX_DURATION_MS: Long = 800
    private const val DEFAULT_MIN_ACCEPTABLE_DELTA: Long = 160
    private const val DEFAULT_DIRECTION = DIRECTION_RIGHT
    private const val DEFAULT_NUMBER_OF_TOUCHES_REQUIRED = 1
  }
}
