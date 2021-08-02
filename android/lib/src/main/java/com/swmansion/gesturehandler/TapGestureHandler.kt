package com.swmansion.gesturehandler

import android.os.Handler
import android.view.MotionEvent
import com.swmansion.gesturehandler.GestureUtils.getLastPointerX
import com.swmansion.gesturehandler.GestureUtils.getLastPointerY

class TapGestureHandler : GestureHandler<TapGestureHandler>() {
  private var mMaxDeltaX = MAX_VALUE_IGNORE
  private var mMaxDeltaY = MAX_VALUE_IGNORE
  private var mMaxDistSq = MAX_VALUE_IGNORE
  private var mMaxDurationMs = DEFAULT_MAX_DURATION_MS
  private var mMaxDelayMs = DEFAULT_MAX_DELAY_MS
  private var mNumberOfTaps = DEFAULT_NUMBER_OF_TAPS
  private var mMinNumberOfPointers = DEFAULT_MIN_NUMBER_OF_POINTERS
  private var mNumberOfPointers = 1
  private var mStartX = 0f
  private var mStartY = 0f
  private var mOffsetX = 0f
  private var mOffsetY = 0f
  private var mLastX = 0f
  private var mLastY = 0f
  private var mHandler: Handler? = null
  private var mTapsSoFar = 0
  private val mFailDelayed = Runnable { fail() }
  override fun resetConfig() {
    super.resetConfig()
    mMaxDeltaX = MAX_VALUE_IGNORE
    mMaxDeltaY = MAX_VALUE_IGNORE
    mMaxDistSq = MAX_VALUE_IGNORE
    mMaxDurationMs = DEFAULT_MAX_DURATION_MS
    mMaxDelayMs = DEFAULT_MAX_DELAY_MS
    mNumberOfTaps = DEFAULT_NUMBER_OF_TAPS
    mMinNumberOfPointers = DEFAULT_MIN_NUMBER_OF_POINTERS
  }

  fun setNumberOfTaps(numberOfTaps: Int): TapGestureHandler {
    mNumberOfTaps = numberOfTaps
    return this
  }

  fun setMaxDelayMs(maxDelayMs: Long): TapGestureHandler {
    mMaxDelayMs = maxDelayMs
    return this
  }

  fun setMaxDurationMs(maxDurationMs: Long): TapGestureHandler {
    mMaxDurationMs = maxDurationMs
    return this
  }

  fun setMaxDx(deltaX: Float): TapGestureHandler {
    mMaxDeltaX = deltaX
    return this
  }

  fun setMaxDy(deltaY: Float): TapGestureHandler {
    mMaxDeltaY = deltaY
    return this
  }

  fun setMaxDist(maxDist: Float): TapGestureHandler {
    mMaxDistSq = maxDist * maxDist
    return this
  }

  fun setMinNumberOfPointers(minNumberOfPointers: Int): TapGestureHandler {
    mMinNumberOfPointers = minNumberOfPointers
    return this
  }

  private fun startTap() {
    if (mHandler == null) {
      mHandler = Handler()
    } else {
      mHandler!!.removeCallbacksAndMessages(null)
    }
    mHandler!!.postDelayed(mFailDelayed, mMaxDurationMs)
  }

  private fun endTap() {
    if (mHandler == null) {
      mHandler = Handler()
    } else {
      mHandler!!.removeCallbacksAndMessages(null)
    }
    if (++mTapsSoFar == mNumberOfTaps && mNumberOfPointers >= mMinNumberOfPointers) {
      activate()
      end()
    } else {
      mHandler!!.postDelayed(mFailDelayed, mMaxDelayMs)
    }
  }

  private fun shouldFail(): Boolean {
    val dx = mLastX - mStartX + mOffsetX
    if (mMaxDeltaX != MAX_VALUE_IGNORE && Math.abs(dx) > mMaxDeltaX) {
      return true
    }
    val dy = mLastY - mStartY + mOffsetY
    if (mMaxDeltaY != MAX_VALUE_IGNORE && Math.abs(dy) > mMaxDeltaY) {
      return true
    }
    val dist = dy * dy + dx * dx
    return mMaxDistSq != MAX_VALUE_IGNORE && dist > mMaxDistSq
  }

  override fun onHandle(event: MotionEvent) {
    val state = state
    val action = event.actionMasked
    if (state == STATE_UNDETERMINED) {
      mOffsetX = 0f
      mOffsetY = 0f
      mStartX = event.rawX
      mStartY = event.rawY
    }
    if (action == MotionEvent.ACTION_POINTER_UP || action == MotionEvent.ACTION_POINTER_DOWN) {
      mOffsetX += mLastX - mStartX
      mOffsetY += mLastY - mStartY
      mLastX = getLastPointerX(event, true)
      mLastY = getLastPointerY(event, true)
      mStartX = mLastX
      mStartY = mLastY
    } else {
      mLastX = getLastPointerX(event, true)
      mLastY = getLastPointerY(event, true)
    }
    if (mNumberOfPointers < event.pointerCount) {
      mNumberOfPointers = event.pointerCount
    }
    if (shouldFail()) {
      fail()
    } else if (state == STATE_UNDETERMINED) {
      if (action == MotionEvent.ACTION_DOWN) {
        begin()
      }
      startTap()
    } else if (state == STATE_BEGAN) {
      if (action == MotionEvent.ACTION_UP) {
        endTap()
      } else if (action == MotionEvent.ACTION_DOWN) {
        startTap()
      }
    }
  }

  override fun onCancel() {
    if (mHandler != null) {
      mHandler!!.removeCallbacksAndMessages(null)
    }
  }

  override fun onReset() {
    mTapsSoFar = 0
    mNumberOfPointers = 0
    if (mHandler != null) {
      mHandler!!.removeCallbacksAndMessages(null)
    }
  }

  companion object {
    private const val MAX_VALUE_IGNORE = Float.MIN_VALUE
    private const val DEFAULT_MAX_DURATION_MS: Long = 500
    private const val DEFAULT_MAX_DELAY_MS: Long = 500
    private const val DEFAULT_NUMBER_OF_TAPS = 1
    private const val DEFAULT_MIN_NUMBER_OF_POINTERS = 1
  }

  init {
    setShouldCancelWhenOutside(true)
  }
}
