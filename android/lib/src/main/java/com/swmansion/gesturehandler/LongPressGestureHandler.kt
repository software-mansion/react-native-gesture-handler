package com.swmansion.gesturehandler

import android.content.Context
import android.os.Handler
import android.os.SystemClock
import android.view.MotionEvent

class LongPressGestureHandler(context: Context) : GestureHandler<LongPressGestureHandler?>() {
  private var mMinDurationMs = DEFAULT_MIN_DURATION_MS
  private val mDefaultMaxDistSq: Float
  private var mMaxDistSq: Float
  private var mStartX = 0f
  private var mStartY = 0f
  private var mStartTime: Long = 0
  private var mPreviousTime: Long = 0
  private var mHandler: Handler? = null
  override fun resetConfig() {
    super.resetConfig()
    mMinDurationMs = DEFAULT_MIN_DURATION_MS
    mMaxDistSq = mDefaultMaxDistSq
  }

  fun setMinDurationMs(minDurationMs: Long) {
    mMinDurationMs = minDurationMs
  }

  fun setMaxDist(maxDist: Float): LongPressGestureHandler {
    mMaxDistSq = maxDist * maxDist
    return this
  }

  override fun onHandle(event: MotionEvent) {
    if (state == STATE_UNDETERMINED) {
      mPreviousTime = SystemClock.uptimeMillis()
      mStartTime = mPreviousTime
      begin()
      mStartX = event.rawX
      mStartY = event.rawY
      mHandler = Handler()
      if (mMinDurationMs > 0) {
        mHandler!!.postDelayed({ activate() }, mMinDurationMs)
      } else if (mMinDurationMs == 0L) {
        activate()
      }
    }
    if (event.actionMasked == MotionEvent.ACTION_UP) {
      if (mHandler != null) {
        mHandler!!.removeCallbacksAndMessages(null)
        mHandler = null
      }
      if (state == STATE_ACTIVE) {
        end()
      } else {
        fail()
      }
    } else {
      // calculate distance from start
      val deltaX = event.rawX - mStartX
      val deltaY = event.rawY - mStartY
      val distSq = deltaX * deltaX + deltaY * deltaY
      if (distSq > mMaxDistSq) {
        if (state == STATE_ACTIVE) {
          cancel()
        } else {
          fail()
        }
      }
    }
  }

  override fun onStateChange(newState: Int, previousState: Int) {
    if (mHandler != null) {
      mHandler!!.removeCallbacksAndMessages(null)
      mHandler = null
    }
  }

  override fun dispatchStateChange(newState: Int, prevState: Int) {
    mPreviousTime = SystemClock.uptimeMillis()
    super.dispatchStateChange(newState, prevState)
  }

  override fun dispatchTouchEvent(event: MotionEvent?) {
    mPreviousTime = SystemClock.uptimeMillis()
    super.dispatchTouchEvent(event)
  }

  val duration: Int
    get() = (mPreviousTime - mStartTime).toInt()

  companion object {
    private const val DEFAULT_MIN_DURATION_MS: Long = 500 // 1 sec
    private const val DEFAULT_MAX_DIST_DP = 10f // 20dp
  }

  init {
    setShouldCancelWhenOutside(true)
    mDefaultMaxDistSq = DEFAULT_MAX_DIST_DP * context.resources.displayMetrics.density
    mMaxDistSq = mDefaultMaxDistSq
  }
}
