package com.swmansion.gesturehandler

import android.content.Context
import android.view.MotionEvent
import android.view.VelocityTracker
import android.view.ViewConfiguration
import com.swmansion.gesturehandler.GestureUtils.getLastPointerX
import com.swmansion.gesturehandler.GestureUtils.getLastPointerY

class PanGestureHandler(context: Context?) : GestureHandler<PanGestureHandler>() {
  private val mDefaultMinDistSq: Float
  private var mMinDistSq = MAX_VALUE_IGNORE
  private var mActiveOffsetXStart = MIN_VALUE_IGNORE
  private var mActiveOffsetXEnd = MAX_VALUE_IGNORE
  private var mFailOffsetXStart = MAX_VALUE_IGNORE
  private var mFailOffsetXEnd = MIN_VALUE_IGNORE
  private var mActiveOffsetYStart = MIN_VALUE_IGNORE
  private var mActiveOffsetYEnd = MAX_VALUE_IGNORE
  private var mFailOffsetYStart = MAX_VALUE_IGNORE
  private var mFailOffsetYEnd = MIN_VALUE_IGNORE
  private var mMinVelocityX = MIN_VALUE_IGNORE
  private var mMinVelocityY = MIN_VALUE_IGNORE
  private var mMinVelocitySq = MIN_VALUE_IGNORE
  private var mMinPointers = DEFAULT_MIN_POINTERS
  private var mMaxPointers = DEFAULT_MAX_POINTERS
  private var mStartX = 0f
  private var mStartY = 0f
  private var mOffsetX = 0f
  private var mOffsetY = 0f
  private var mLastX = 0f
  private var mLastY = 0f
  var velocityX = 0f
    private set
  var velocityY = 0f
    private set
  private var mVelocityTracker: VelocityTracker? = null
  private var mAverageTouches = false

  /**
   * On Android when there are multiple pointers on the screen pan gestures most often just consider
   * the last placed pointer. The behaviour on iOS is quite different where the x and y component
   * of the pan pointer is calculated as an average out of all the pointers placed on the screen.
   *
   * This behaviour can be customized on android by setting averageTouches property of the handler
   * object. This could be useful in particular for the usecases when we attach other handlers that
   * recognizes multi-finger gestures such as rotation. In that case when we only rely on the last
   * placed finger it is easier for the gesture handler to trigger when we do a rotation gesture
   * because each finger when treated separately will travel some distance, whereas the average
   * position of all the fingers will remain still while doing a rotation gesture.
   */
  init {
    val vc = ViewConfiguration.get(context)
    val touchSlop = vc.scaledTouchSlop
    mDefaultMinDistSq = (touchSlop * touchSlop).toFloat()
    mMinDistSq = mDefaultMinDistSq
  }

  override fun resetConfig() {
    super.resetConfig()
    mMinDistSq = MAX_VALUE_IGNORE
    mActiveOffsetXStart = MIN_VALUE_IGNORE
    mActiveOffsetXEnd = MAX_VALUE_IGNORE
    mFailOffsetXStart = MAX_VALUE_IGNORE
    mFailOffsetXEnd = MIN_VALUE_IGNORE
    mActiveOffsetYStart = MIN_VALUE_IGNORE
    mActiveOffsetYEnd = MAX_VALUE_IGNORE
    mFailOffsetYStart = MAX_VALUE_IGNORE
    mFailOffsetYEnd = MIN_VALUE_IGNORE
    mMinVelocityX = MIN_VALUE_IGNORE
    mMinVelocityY = MIN_VALUE_IGNORE
    mMinVelocitySq = MIN_VALUE_IGNORE
    mMinDistSq = mDefaultMinDistSq
    mMinPointers = DEFAULT_MIN_POINTERS
    mMaxPointers = DEFAULT_MAX_POINTERS
    mAverageTouches = false
  }

  fun setActiveOffsetXStart(activeOffsetXStart: Float): PanGestureHandler {
    mActiveOffsetXStart = activeOffsetXStart
    return this
  }

  fun setActiveOffsetXEnd(activeOffsetXEnd: Float): PanGestureHandler {
    mActiveOffsetXEnd = activeOffsetXEnd
    return this
  }

  fun setFailOffsetXStart(failOffsetXStart: Float): PanGestureHandler {
    mFailOffsetXStart = failOffsetXStart
    return this
  }

  fun setFailOffsetXEnd(failOffsetXEnd: Float): PanGestureHandler {
    mFailOffsetXEnd = failOffsetXEnd
    return this
  }

  fun setActiveOffsetYStart(activeOffsetYStart: Float): PanGestureHandler {
    mActiveOffsetYStart = activeOffsetYStart
    return this
  }

  fun setActiveOffsetYEnd(activeOffsetYEnd: Float): PanGestureHandler {
    mActiveOffsetYEnd = activeOffsetYEnd
    return this
  }

  fun setFailOffsetYStart(failOffsetYStart: Float): PanGestureHandler {
    mFailOffsetYStart = failOffsetYStart
    return this
  }

  fun setFailOffsetYEnd(failOffsetYEnd: Float): PanGestureHandler {
    mFailOffsetYEnd = failOffsetYEnd
    return this
  }

  fun setMinDist(minDist: Float): PanGestureHandler {
    mMinDistSq = minDist * minDist
    return this
  }

  fun setMinPointers(minPointers: Int): PanGestureHandler {
    mMinPointers = minPointers
    return this
  }

  fun setMaxPointers(maxPointers: Int): PanGestureHandler {
    mMaxPointers = maxPointers
    return this
  }

  fun setAverageTouches(averageTouches: Boolean): PanGestureHandler {
    mAverageTouches = averageTouches
    return this
  }

  /**
   * @param minVelocity in pixels per second
   */
  fun setMinVelocity(minVelocity: Float): PanGestureHandler {
    mMinVelocitySq = minVelocity * minVelocity
    return this
  }

  fun setMinVelocityX(minVelocityX: Float): PanGestureHandler {
    mMinVelocityX = minVelocityX
    return this
  }

  fun setMinVelocityY(minVelocityY: Float): PanGestureHandler {
    mMinVelocityY = minVelocityY
    return this
  }

  private fun shouldActivate(): Boolean {
    val dx = mLastX - mStartX + mOffsetX
    if (mActiveOffsetXStart != MIN_VALUE_IGNORE && dx < mActiveOffsetXStart) {
      return true
    }
    if (mActiveOffsetXEnd != MAX_VALUE_IGNORE && dx > mActiveOffsetXEnd) {
      return true
    }
    val dy = mLastY - mStartY + mOffsetY
    if (mActiveOffsetYStart != MIN_VALUE_IGNORE && dy < mActiveOffsetYStart) {
      return true
    }
    if (mActiveOffsetYEnd != MAX_VALUE_IGNORE && dy > mActiveOffsetYEnd) {
      return true
    }
    val distSq = dx * dx + dy * dy
    if (mMinDistSq != MIN_VALUE_IGNORE && distSq >= mMinDistSq) {
      return true
    }
    val vx = velocityX
    if (mMinVelocityX != MIN_VALUE_IGNORE &&
      (mMinVelocityX < 0 && vx <= mMinVelocityX || mMinVelocityX >= 0 && vx >= mMinVelocityX)) {
      return true
    }
    val vy = velocityY
    if (mMinVelocityY != MIN_VALUE_IGNORE &&
      (mMinVelocityY < 0 && vx <= mMinVelocityY || mMinVelocityY >= 0 && vx >= mMinVelocityY)) {
      return true
    }
    val velocitySq = vx * vx + vy * vy
    return mMinVelocitySq != MIN_VALUE_IGNORE && velocitySq >= mMinVelocitySq
  }

  private fun shouldFail(): Boolean {
    val dx = mLastX - mStartX + mOffsetX
    if (mFailOffsetXStart != MAX_VALUE_IGNORE && dx < mFailOffsetXStart) {
      return true
    }
    if (mFailOffsetXEnd != MIN_VALUE_IGNORE && dx > mFailOffsetXEnd) {
      return true
    }
    val dy = mLastY - mStartY + mOffsetY
    if (mFailOffsetYStart != MAX_VALUE_IGNORE && dy < mFailOffsetYStart) {
      return true
    }
    return mFailOffsetYEnd != MIN_VALUE_IGNORE && dy > mFailOffsetYEnd
  }

  override fun onHandle(event: MotionEvent) {
    val state = state
    val action = event.actionMasked
    if (action == MotionEvent.ACTION_POINTER_UP || action == MotionEvent.ACTION_POINTER_DOWN) {
      // update offset if new pointer gets added or removed
      mOffsetX += mLastX - mStartX
      mOffsetY += mLastY - mStartY

      // reset starting point
      mLastX = getLastPointerX(event, mAverageTouches)
      mLastY = getLastPointerY(event, mAverageTouches)
      mStartX = mLastX
      mStartY = mLastY
    } else {
      mLastX = getLastPointerX(event, mAverageTouches)
      mLastY = getLastPointerY(event, mAverageTouches)
    }
    if (state == STATE_UNDETERMINED && event.pointerCount >= mMinPointers) {
      mStartX = mLastX
      mStartY = mLastY
      mOffsetX = 0f
      mOffsetY = 0f
      mVelocityTracker = VelocityTracker.obtain()
      addVelocityMovement(mVelocityTracker, event)
      begin()
    } else if (mVelocityTracker != null) {
      addVelocityMovement(mVelocityTracker, event)
      mVelocityTracker!!.computeCurrentVelocity(1000)
      velocityX = mVelocityTracker!!.xVelocity
      velocityY = mVelocityTracker!!.yVelocity
    }
    if (action == MotionEvent.ACTION_UP) {
      if (state == STATE_ACTIVE) {
        end()
      } else {
        fail()
      }
    } else if (action == MotionEvent.ACTION_POINTER_DOWN && event.pointerCount > mMaxPointers) {
      // When new finger is placed down (POINTER_DOWN) we check if MAX_POINTERS is not exceeded
      if (state == STATE_ACTIVE) {
        cancel()
      } else {
        fail()
      }
    } else if (action == MotionEvent.ACTION_POINTER_UP && state == STATE_ACTIVE && event.pointerCount < mMinPointers) {
      // When finger is lifted up (POINTER_UP) and the number of pointers falls below MIN_POINTERS
      // threshold, we only want to take an action when the handler has already activated. Otherwise
      // we can still expect more fingers to be placed on screen and fulfill MIN_POINTERS criteria.
      fail()
    } else if (state == STATE_BEGAN) {
      if (shouldFail()) {
        fail()
      } else if (shouldActivate()) {
        // reset starting point
        mStartX = mLastX
        mStartY = mLastY
        activate()
      }
    }
  }

  override fun onReset() {
    mVelocityTracker?.let {
      it.recycle()
      mVelocityTracker = null
    }
  }

  val translationX: Float
    get() = mLastX - mStartX + mOffsetX
  val translationY: Float
    get() = mLastY - mStartY + mOffsetY

  companion object {
    private const val MIN_VALUE_IGNORE = Float.MAX_VALUE
    private const val MAX_VALUE_IGNORE = Float.MIN_VALUE
    private const val DEFAULT_MIN_POINTERS = 1
    private const val DEFAULT_MAX_POINTERS = 10

    /**
     * This method adds movement to {@class VelocityTracker} first resetting offset of the event so
     * that the velocity is calculated based on the absolute position of touch pointers. This is
     * because if the underlying view moves along with the finger using relative x/y coords yields
     * incorrect results.
     */
    private fun addVelocityMovement(tracker: VelocityTracker?, event: MotionEvent) {
      val offsetX = event.rawX - event.x
      val offsetY = event.rawY - event.y
      event.offsetLocation(offsetX, offsetY)
      tracker!!.addMovement(event)
      event.offsetLocation(-offsetX, -offsetY)
    }
  }
}
