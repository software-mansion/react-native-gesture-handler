package com.swmansion.gesturehandler

import android.content.Context
import android.view.MotionEvent
import android.view.VelocityTracker
import android.view.ViewConfiguration
import com.swmansion.gesturehandler.GestureUtils.getLastPointerX
import com.swmansion.gesturehandler.GestureUtils.getLastPointerY

class PanGestureHandler(context: Context?) : GestureHandler<PanGestureHandler>() {
  var velocityX = 0f
    private set
  var velocityY = 0f
    private set
  private val defaultMinDistSq: Float
  private var minDistSq = MAX_VALUE_IGNORE
  private var activeOffsetXStart = MIN_VALUE_IGNORE
  private var activeOffsetXEnd = MAX_VALUE_IGNORE
  private var failOffsetXStart = MAX_VALUE_IGNORE
  private var failOffsetXEnd = MIN_VALUE_IGNORE
  private var activeOffsetYStart = MIN_VALUE_IGNORE
  private var activeOffsetYEnd = MAX_VALUE_IGNORE
  private var failOffsetYStart = MAX_VALUE_IGNORE
  private var failOffsetYEnd = MIN_VALUE_IGNORE
  private var minVelocityX = MIN_VALUE_IGNORE
  private var minVelocityY = MIN_VALUE_IGNORE
  private var minVelocitySq = MIN_VALUE_IGNORE
  private var minPointers = DEFAULT_MIN_POINTERS
  private var maxPointers = DEFAULT_MAX_POINTERS
  private var startX = 0f
  private var startY = 0f
  private var offsetX = 0f
  private var offsetY = 0f
  private var lastX = 0f
  private var lastY = 0f
  private var velocityTracker: VelocityTracker? = null
  private var averageTouches = false

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
    defaultMinDistSq = (touchSlop * touchSlop).toFloat()
    minDistSq = defaultMinDistSq
  }

  override fun resetConfig() {
    super.resetConfig()
    minDistSq = MAX_VALUE_IGNORE
    activeOffsetXStart = MIN_VALUE_IGNORE
    activeOffsetXEnd = MAX_VALUE_IGNORE
    failOffsetXStart = MAX_VALUE_IGNORE
    failOffsetXEnd = MIN_VALUE_IGNORE
    activeOffsetYStart = MIN_VALUE_IGNORE
    activeOffsetYEnd = MAX_VALUE_IGNORE
    failOffsetYStart = MAX_VALUE_IGNORE
    failOffsetYEnd = MIN_VALUE_IGNORE
    minVelocityX = MIN_VALUE_IGNORE
    minVelocityY = MIN_VALUE_IGNORE
    minVelocitySq = MIN_VALUE_IGNORE
    minDistSq = defaultMinDistSq
    minPointers = DEFAULT_MIN_POINTERS
    maxPointers = DEFAULT_MAX_POINTERS
    averageTouches = false
  }

  fun setActiveOffsetXStart(activeOffsetXStart: Float): PanGestureHandler {
    this.activeOffsetXStart = activeOffsetXStart
    return this
  }

  fun setActiveOffsetXEnd(activeOffsetXEnd: Float): PanGestureHandler {
    this.activeOffsetXEnd = activeOffsetXEnd
    return this
  }

  fun setFailOffsetXStart(failOffsetXStart: Float): PanGestureHandler {
    this.failOffsetXStart = failOffsetXStart
    return this
  }

  fun setFailOffsetXEnd(failOffsetXEnd: Float): PanGestureHandler {
    this.failOffsetXEnd = failOffsetXEnd
    return this
  }

  fun setActiveOffsetYStart(activeOffsetYStart: Float): PanGestureHandler {
    this.activeOffsetYStart = activeOffsetYStart
    return this
  }

  fun setActiveOffsetYEnd(activeOffsetYEnd: Float): PanGestureHandler {
    this.activeOffsetYEnd = activeOffsetYEnd
    return this
  }

  fun setFailOffsetYStart(failOffsetYStart: Float): PanGestureHandler {
    this.failOffsetYStart = failOffsetYStart
    return this
  }

  fun setFailOffsetYEnd(failOffsetYEnd: Float): PanGestureHandler {
    this.failOffsetYEnd = failOffsetYEnd
    return this
  }

  fun setMinDist(minDist: Float): PanGestureHandler {
    minDistSq = minDist * minDist
    return this
  }

  fun setMinPointers(minPointers: Int): PanGestureHandler {
    this.minPointers = minPointers
    return this
  }

  fun setMaxPointers(maxPointers: Int): PanGestureHandler {
    this.maxPointers = maxPointers
    return this
  }

  fun setAverageTouches(averageTouches: Boolean): PanGestureHandler {
    this.averageTouches = averageTouches
    return this
  }

  /**
   * @param minVelocity in pixels per second
   */
  fun setMinVelocity(minVelocity: Float): PanGestureHandler {
    minVelocitySq = minVelocity * minVelocity
    return this
  }

  fun setMinVelocityX(minVelocityX: Float): PanGestureHandler {
    this.minVelocityX = minVelocityX
    return this
  }

  fun setMinVelocityY(minVelocityY: Float): PanGestureHandler {
    this.minVelocityY = minVelocityY
    return this
  }

  private fun shouldActivate(): Boolean {
    val dx = lastX - startX + offsetX
    if (activeOffsetXStart != MIN_VALUE_IGNORE && dx < activeOffsetXStart) {
      return true
    }
    if (activeOffsetXEnd != MAX_VALUE_IGNORE && dx > activeOffsetXEnd) {
      return true
    }
    val dy = lastY - startY + offsetY
    if (activeOffsetYStart != MIN_VALUE_IGNORE && dy < activeOffsetYStart) {
      return true
    }
    if (activeOffsetYEnd != MAX_VALUE_IGNORE && dy > activeOffsetYEnd) {
      return true
    }
    val distSq = dx * dx + dy * dy
    if (minDistSq != MIN_VALUE_IGNORE && distSq >= minDistSq) {
      return true
    }
    val vx = velocityX
    if (minVelocityX != MIN_VALUE_IGNORE &&
      (minVelocityX < 0 && vx <= minVelocityX || minVelocityX in 0.0f..vx)) {
      return true
    }
    val vy = velocityY
    if (minVelocityY != MIN_VALUE_IGNORE &&
      (minVelocityY < 0 && vx <= minVelocityY || minVelocityY in 0.0f..vx)) {
      return true
    }
    val velocitySq = vx * vx + vy * vy
    return minVelocitySq != MIN_VALUE_IGNORE && velocitySq >= minVelocitySq
  }

  private fun shouldFail(): Boolean {
    val dx = lastX - startX + offsetX
    if (failOffsetXStart != MAX_VALUE_IGNORE && dx < failOffsetXStart) {
      return true
    }
    if (failOffsetXEnd != MIN_VALUE_IGNORE && dx > failOffsetXEnd) {
      return true
    }
    val dy = lastY - startY + offsetY
    if (failOffsetYStart != MAX_VALUE_IGNORE && dy < failOffsetYStart) {
      return true
    }
    return failOffsetYEnd != MIN_VALUE_IGNORE && dy > failOffsetYEnd
  }

  override fun onHandle(event: MotionEvent) {
    val state = state
    val action = event.actionMasked
    if (action == MotionEvent.ACTION_POINTER_UP || action == MotionEvent.ACTION_POINTER_DOWN) {
      // update offset if new pointer gets added or removed
      offsetX += lastX - startX
      offsetY += lastY - startY

      // reset starting point
      lastX = getLastPointerX(event, averageTouches)
      lastY = getLastPointerY(event, averageTouches)
      startX = lastX
      startY = lastY
    } else {
      lastX = getLastPointerX(event, averageTouches)
      lastY = getLastPointerY(event, averageTouches)
    }
    if (state == STATE_UNDETERMINED && event.pointerCount >= minPointers) {
      startX = lastX
      startY = lastY
      offsetX = 0f
      offsetY = 0f
      velocityTracker = VelocityTracker.obtain()
      addVelocityMovement(velocityTracker, event)
      begin()
    } else if (velocityTracker != null) {
      addVelocityMovement(velocityTracker, event)
      velocityTracker!!.computeCurrentVelocity(1000)
      velocityX = velocityTracker!!.xVelocity
      velocityY = velocityTracker!!.yVelocity
    }
    if (action == MotionEvent.ACTION_UP) {
      if (state == STATE_ACTIVE) {
        end()
      } else {
        fail()
      }
    } else if (action == MotionEvent.ACTION_POINTER_DOWN && event.pointerCount > maxPointers) {
      // When new finger is placed down (POINTER_DOWN) we check if MAX_POINTERS is not exceeded
      if (state == STATE_ACTIVE) {
        cancel()
      } else {
        fail()
      }
    } else if (action == MotionEvent.ACTION_POINTER_UP && state == STATE_ACTIVE && event.pointerCount < minPointers) {
      // When finger is lifted up (POINTER_UP) and the number of pointers falls below MIN_POINTERS
      // threshold, we only want to take an action when the handler has already activated. Otherwise
      // we can still expect more fingers to be placed on screen and fulfill MIN_POINTERS criteria.
      fail()
    } else if (state == STATE_BEGAN) {
      if (shouldFail()) {
        fail()
      } else if (shouldActivate()) {
        // reset starting point
        startX = lastX
        startY = lastY
        activate()
      }
    }
  }

  override fun onReset() {
    velocityTracker?.let {
      it.recycle()
      velocityTracker = null
    }
  }

  val translationX: Float
    get() = lastX - startX + offsetX
  val translationY: Float
    get() = lastY - startY + offsetY

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
