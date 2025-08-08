package com.swmansion.gesturehandler.core

import android.content.Context
import android.os.Handler
import android.os.Looper
import android.view.MotionEvent
import android.view.VelocityTracker
import android.view.ViewConfiguration
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.uimanager.PixelUtil
import com.swmansion.gesturehandler.core.GestureUtils.getLastPointerX
import com.swmansion.gesturehandler.core.GestureUtils.getLastPointerY
import com.swmansion.gesturehandler.react.eventbuilders.PanGestureHandlerEventDataBuilder

class PanGestureHandler(context: Context?) : GestureHandler() {
  var velocityX = 0f
    private set
  var velocityY = 0f
    private set
  val translationX: Float
    get() = lastX - startX + offsetX
  val translationY: Float
    get() = lastY - startY + offsetY

  private val defaultMinDist: Float
  private var minDist = MAX_VALUE_IGNORE
  private var activeOffsetXStart = MIN_VALUE_IGNORE
  private var activeOffsetXEnd = MAX_VALUE_IGNORE
  private var failOffsetXStart = MAX_VALUE_IGNORE
  private var failOffsetXEnd = MIN_VALUE_IGNORE
  private var activeOffsetYStart = MIN_VALUE_IGNORE
  private var activeOffsetYEnd = MAX_VALUE_IGNORE
  private var failOffsetYStart = MAX_VALUE_IGNORE
  private var failOffsetYEnd = MIN_VALUE_IGNORE

  /**
   * in pixels per second
   */
  private var minVelocityX = MIN_VALUE_IGNORE
  private var minVelocityY = MIN_VALUE_IGNORE
  private var minVelocity = MIN_VALUE_IGNORE
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
  private var activateAfterLongPress = DEFAULT_ACTIVATE_AFTER_LONG_PRESS
  private val activateDelayed = Runnable { activate() }
  private var handler: Handler? = null
  var stylusData: StylusData = StylusData()
    private set

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
    val vc = ViewConfiguration.get(context!!)
    defaultMinDist = vc.scaledTouchSlop.toFloat()
    minDist = defaultMinDist
  }

  override fun resetConfig() {
    super.resetConfig()
    activeOffsetXStart = DEFAULT_ACTIVE_OFFSET_X_START
    activeOffsetXEnd = DEFAULT_ACTIVE_OFFSET_X_END
    failOffsetXStart = DEFAULT_FAIL_OFFSET_X_START
    failOffsetXEnd = DEFAULT_FAIL_OFFSET_X_END
    activeOffsetYStart = DEFAULT_ACTIVE_OFFSET_Y_START
    activeOffsetYEnd = DEFAULT_ACTIVE_OFFSET_Y_END
    failOffsetYStart = DEFAULT_FAIL_OFFSET_Y_START
    failOffsetYEnd = DEFAULT_FAIL_OFFSET_Y_END
    minVelocityX = DEFAULT_MIN_VELOCITY_X
    minVelocityY = DEFAULT_MIN_VELOCITY_Y
    minVelocity = DEFAULT_MIN_VELOCITY
    minDist = defaultMinDist
    minPointers = DEFAULT_MIN_POINTERS
    maxPointers = DEFAULT_MAX_POINTERS
    activateAfterLongPress = DEFAULT_ACTIVATE_AFTER_LONG_PRESS
    averageTouches = DEFAULT_AVERAGE_TOUCHES
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
    if (minDist != MIN_VALUE_IGNORE && distSq >= minDist * minDist) {
      return true
    }
    val vx = velocityX
    if (minVelocityX != MIN_VALUE_IGNORE &&
      (minVelocityX < 0 && vx <= minVelocityX || minVelocityX in 0.0f..vx)
    ) {
      return true
    }
    val vy = velocityY
    if (minVelocityY != MIN_VALUE_IGNORE &&
      (minVelocityY < 0 && vx <= minVelocityY || minVelocityY in 0.0f..vx)
    ) {
      return true
    }
    val velocitySq = vx * vx + vy * vy
    return minVelocity != MIN_VALUE_IGNORE && velocitySq >= minVelocity * minVelocity
  }

  private fun shouldFail(): Boolean {
    val dx = lastX - startX + offsetX
    val dy = lastY - startY + offsetY

    if (activateAfterLongPress > 0 && dx * dx + dy * dy > defaultMinDist * defaultMinDist) {
      handler?.removeCallbacksAndMessages(null)
      return true
    }
    if (failOffsetXStart != MAX_VALUE_IGNORE && dx < failOffsetXStart) {
      return true
    }
    if (failOffsetXEnd != MIN_VALUE_IGNORE && dx > failOffsetXEnd) {
      return true
    }
    if (failOffsetYStart != MAX_VALUE_IGNORE && dy < failOffsetYStart) {
      return true
    }
    return failOffsetYEnd != MIN_VALUE_IGNORE && dy > failOffsetYEnd
  }

  override fun onHandle(event: MotionEvent, sourceEvent: MotionEvent) {
    if (!shouldActivateWithMouse(sourceEvent)) {
      return
    }

    if (event.getToolType(0) == MotionEvent.TOOL_TYPE_STYLUS) {
      stylusData = StylusData.fromEvent(event)
    }

    val state = state
    val action = sourceEvent.actionMasked
    if (action == MotionEvent.ACTION_POINTER_UP || action == MotionEvent.ACTION_POINTER_DOWN) {
      // update offset if new pointer gets added or removed
      offsetX += lastX - startX
      offsetY += lastY - startY

      // reset starting point
      lastX = getLastPointerX(sourceEvent, averageTouches)
      lastY = getLastPointerY(sourceEvent, averageTouches)
      startX = lastX
      startY = lastY
    } else {
      lastX = getLastPointerX(sourceEvent, averageTouches)
      lastY = getLastPointerY(sourceEvent, averageTouches)
    }
    if (state == STATE_UNDETERMINED && sourceEvent.pointerCount >= minPointers) {
      resetProgress()
      offsetX = 0f
      offsetY = 0f
      velocityX = 0f
      velocityY = 0f
      velocityTracker = VelocityTracker.obtain()
      addVelocityMovement(velocityTracker, sourceEvent)
      begin()

      if (activateAfterLongPress > 0) {
        if (handler == null) {
          handler = Handler(Looper.getMainLooper())
        }
        handler!!.postDelayed(activateDelayed, activateAfterLongPress)
      }
    } else if (velocityTracker != null) {
      addVelocityMovement(velocityTracker, sourceEvent)
      velocityTracker!!.computeCurrentVelocity(1000)
      velocityX = velocityTracker!!.xVelocity
      velocityY = velocityTracker!!.yVelocity
    }
    if (action == MotionEvent.ACTION_UP || action == MotionEvent.ACTION_BUTTON_RELEASE) {
      if (state == STATE_ACTIVE) {
        end()
      } else {
        fail()
      }
    } else if (action == MotionEvent.ACTION_POINTER_DOWN &&
      sourceEvent.pointerCount > maxPointers
    ) {
      // When new finger is placed down (POINTER_DOWN) we check if MAX_POINTERS is not exceeded
      if (state == STATE_ACTIVE) {
        cancel()
      } else {
        fail()
      }
    } else if (action == MotionEvent.ACTION_POINTER_UP &&
      state == STATE_ACTIVE &&
      sourceEvent.pointerCount < minPointers
    ) {
      // When finger is lifted up (POINTER_UP) and the number of pointers falls below MIN_POINTERS
      // threshold, we only want to take an action when the handler has already activated. Otherwise
      // we can still expect more fingers to be placed on screen and fulfill MIN_POINTERS criteria.
      fail()
    } else if (state == STATE_BEGAN) {
      if (shouldFail()) {
        fail()
      } else if (shouldActivate()) {
        activate()
      }
    }
  }

  override fun activate(force: Boolean) {
    // reset starting point if the handler has not yet activated
    if (state != STATE_ACTIVE) {
      resetProgress()
    }
    super.activate(force)
  }

  override fun onCancel() {
    handler?.removeCallbacksAndMessages(null)
  }

  override fun onReset() {
    handler?.removeCallbacksAndMessages(null)
    velocityTracker?.let {
      it.recycle()
      velocityTracker = null
    }

    stylusData = StylusData()
  }

  override fun resetProgress() {
    startX = lastX
    startY = lastY
  }

  class Factory : GestureHandler.Factory<PanGestureHandler>() {
    override val type = PanGestureHandler::class.java
    override val name = "PanGestureHandler"

    override fun create(context: Context?): PanGestureHandler = PanGestureHandler(context)

    override fun updateConfig(handler: PanGestureHandler, config: ReadableMap) {
      super.updateConfig(handler, config)
      var hasCustomActivationCriteria = false
      if (config.hasKey(KEY_ACTIVE_OFFSET_X_START)) {
        handler.activeOffsetXStart =
          PixelUtil.toPixelFromDIP(
            config.getDouble(
              KEY_ACTIVE_OFFSET_X_START,
            ),
          )
        hasCustomActivationCriteria = true
      }
      if (config.hasKey(KEY_ACTIVE_OFFSET_X_END)) {
        handler.activeOffsetXEnd =
          PixelUtil.toPixelFromDIP(
            config.getDouble(
              KEY_ACTIVE_OFFSET_X_END,
            ),
          )
        hasCustomActivationCriteria = true
      }
      if (config.hasKey(KEY_FAIL_OFFSET_RANGE_X_START)) {
        handler.failOffsetXStart =
          PixelUtil.toPixelFromDIP(
            config.getDouble(
              KEY_FAIL_OFFSET_RANGE_X_START,
            ),
          )
        hasCustomActivationCriteria = true
      }
      if (config.hasKey(KEY_FAIL_OFFSET_RANGE_X_END)) {
        handler.failOffsetXEnd =
          PixelUtil.toPixelFromDIP(
            config.getDouble(
              KEY_FAIL_OFFSET_RANGE_X_END,
            ),
          )
        hasCustomActivationCriteria = true
      }
      if (config.hasKey(KEY_ACTIVE_OFFSET_Y_START)) {
        handler.activeOffsetYStart =
          PixelUtil.toPixelFromDIP(
            config.getDouble(
              KEY_ACTIVE_OFFSET_Y_START,
            ),
          )
        hasCustomActivationCriteria = true
      }
      if (config.hasKey(KEY_ACTIVE_OFFSET_Y_END)) {
        handler.activeOffsetYEnd =
          PixelUtil.toPixelFromDIP(
            config.getDouble(
              KEY_ACTIVE_OFFSET_Y_END,
            ),
          )
        hasCustomActivationCriteria = true
      }
      if (config.hasKey(KEY_FAIL_OFFSET_RANGE_Y_START)) {
        handler.failOffsetYStart =
          PixelUtil.toPixelFromDIP(
            config.getDouble(
              KEY_FAIL_OFFSET_RANGE_Y_START,
            ),
          )
        hasCustomActivationCriteria = true
      }
      if (config.hasKey(KEY_FAIL_OFFSET_RANGE_Y_END)) {
        handler.failOffsetYEnd =
          PixelUtil.toPixelFromDIP(
            config.getDouble(
              KEY_FAIL_OFFSET_RANGE_Y_END,
            ),
          )
        hasCustomActivationCriteria = true
      }
      if (config.hasKey(KEY_MIN_VELOCITY)) {
        // This value is actually in DPs/ms, but we can use the same function as for converting
        // from DPs to pixels as the unit we're converting is in the numerator
        handler.minVelocity = PixelUtil.toPixelFromDIP(config.getDouble(KEY_MIN_VELOCITY))
        hasCustomActivationCriteria = true
      }
      if (config.hasKey(KEY_MIN_VELOCITY_X)) {
        handler.minVelocityX = PixelUtil.toPixelFromDIP(config.getDouble(KEY_MIN_VELOCITY_X))
        hasCustomActivationCriteria = true
      }
      if (config.hasKey(KEY_MIN_VELOCITY_Y)) {
        handler.minVelocityY = PixelUtil.toPixelFromDIP(config.getDouble(KEY_MIN_VELOCITY_Y))
        hasCustomActivationCriteria = true
      }

      // PanGestureHandler sets minDist by default, if there are custom criteria specified we want
      // to reset that setting and use provided criteria instead.
      if (config.hasKey(KEY_MIN_DIST)) {
        handler.minDist = PixelUtil.toPixelFromDIP(config.getDouble(KEY_MIN_DIST))
      } else if (hasCustomActivationCriteria) {
        handler.minDist = Float.MAX_VALUE
      }
      if (config.hasKey(KEY_MIN_POINTERS)) {
        handler.minPointers = config.getInt(KEY_MIN_POINTERS)
      }
      if (config.hasKey(KEY_MAX_POINTERS)) {
        handler.maxPointers = config.getInt(KEY_MAX_POINTERS)
      }
      if (config.hasKey(KEY_AVG_TOUCHES)) {
        handler.averageTouches = config.getBoolean(KEY_AVG_TOUCHES)
      }
      if (config.hasKey(KEY_ACTIVATE_AFTER_LONG_PRESS)) {
        handler.activateAfterLongPress = config.getInt(KEY_ACTIVATE_AFTER_LONG_PRESS).toLong()
      }
    }

    override fun createEventBuilder(handler: PanGestureHandler) = PanGestureHandlerEventDataBuilder(handler)

    companion object {
      private const val KEY_ACTIVE_OFFSET_X_START = "activeOffsetXStart"
      private const val KEY_ACTIVE_OFFSET_X_END = "activeOffsetXEnd"
      private const val KEY_FAIL_OFFSET_RANGE_X_START = "failOffsetXStart"
      private const val KEY_FAIL_OFFSET_RANGE_X_END = "failOffsetXEnd"
      private const val KEY_ACTIVE_OFFSET_Y_START = "activeOffsetYStart"
      private const val KEY_ACTIVE_OFFSET_Y_END = "activeOffsetYEnd"
      private const val KEY_FAIL_OFFSET_RANGE_Y_START = "failOffsetYStart"
      private const val KEY_FAIL_OFFSET_RANGE_Y_END = "failOffsetYEnd"
      private const val KEY_MIN_DIST = "minDist"
      private const val KEY_MIN_VELOCITY = "minVelocity"
      private const val KEY_MIN_VELOCITY_X = "minVelocityX"
      private const val KEY_MIN_VELOCITY_Y = "minVelocityY"
      private const val KEY_MIN_POINTERS = "minPointers"
      private const val KEY_MAX_POINTERS = "maxPointers"
      private const val KEY_AVG_TOUCHES = "avgTouches"
      private const val KEY_ACTIVATE_AFTER_LONG_PRESS = "activateAfterLongPress"
    }
  }

  companion object {
    private const val MIN_VALUE_IGNORE = Float.MAX_VALUE
    private const val MAX_VALUE_IGNORE = Float.MIN_VALUE
    private const val DEFAULT_MIN_POINTERS = 1
    private const val DEFAULT_MAX_POINTERS = 10
    private const val DEFAULT_ACTIVATE_AFTER_LONG_PRESS = 0L
    private const val DEFAULT_AVERAGE_TOUCHES = false
    private const val DEFAULT_ACTIVE_OFFSET_X_START = MIN_VALUE_IGNORE
    private const val DEFAULT_ACTIVE_OFFSET_X_END = MAX_VALUE_IGNORE
    private const val DEFAULT_FAIL_OFFSET_X_START = MAX_VALUE_IGNORE
    private const val DEFAULT_FAIL_OFFSET_X_END = MIN_VALUE_IGNORE
    private const val DEFAULT_ACTIVE_OFFSET_Y_START = MIN_VALUE_IGNORE
    private const val DEFAULT_ACTIVE_OFFSET_Y_END = MAX_VALUE_IGNORE
    private const val DEFAULT_FAIL_OFFSET_Y_START = MAX_VALUE_IGNORE
    private const val DEFAULT_FAIL_OFFSET_Y_END = MIN_VALUE_IGNORE
    private const val DEFAULT_MIN_VELOCITY_X = MIN_VALUE_IGNORE
    private const val DEFAULT_MIN_VELOCITY_Y = MIN_VALUE_IGNORE
    private const val DEFAULT_MIN_VELOCITY = MIN_VALUE_IGNORE

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
