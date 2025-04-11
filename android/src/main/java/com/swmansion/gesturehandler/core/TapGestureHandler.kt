package com.swmansion.gesturehandler.core

import android.content.Context
import android.os.Handler
import android.os.Looper
import android.view.MotionEvent
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.uimanager.PixelUtil
import com.swmansion.gesturehandler.core.GestureUtils.getLastPointerX
import com.swmansion.gesturehandler.core.GestureUtils.getLastPointerY
import com.swmansion.gesturehandler.react.eventbuilders.TapGestureHandlerEventDataBuilder
import kotlin.math.abs

class TapGestureHandler : GestureHandler<TapGestureHandler>() {
  private var maxDeltaX = MAX_VALUE_IGNORE
  private var maxDeltaY = MAX_VALUE_IGNORE
  private var maxDistSq = MAX_VALUE_IGNORE
  private var maxDurationMs = DEFAULT_MAX_DURATION_MS
  private var maxDelayMs = DEFAULT_MAX_DELAY_MS
  private var numberOfTaps = DEFAULT_NUMBER_OF_TAPS
  private var minNumberOfPointers = DEFAULT_MIN_NUMBER_OF_POINTERS
  private var currentMaxNumberOfPointers = 1
  private var startX = 0f
  private var startY = 0f
  private var offsetX = 0f
  private var offsetY = 0f
  private var lastX = 0f
  private var lastY = 0f
  private var handler: Handler? = null
  private var tapsSoFar = 0
  private val failDelayed = Runnable { fail() }

  init {
    setShouldCancelWhenOutside(true)
  }

  override fun resetConfig() {
    super.resetConfig()
    maxDeltaX = MAX_VALUE_IGNORE
    maxDeltaY = MAX_VALUE_IGNORE
    maxDistSq = MAX_VALUE_IGNORE
    maxDurationMs = DEFAULT_MAX_DURATION_MS
    maxDelayMs = DEFAULT_MAX_DELAY_MS
    numberOfTaps = DEFAULT_NUMBER_OF_TAPS
    minNumberOfPointers = DEFAULT_MIN_NUMBER_OF_POINTERS
  }

  fun setNumberOfTaps(numberOfTaps: Int) = apply {
    this.numberOfTaps = numberOfTaps
  }

  fun setMaxDelayMs(maxDelayMs: Long) = apply {
    this.maxDelayMs = maxDelayMs
  }

  fun setMaxDurationMs(maxDurationMs: Long) = apply {
    this.maxDurationMs = maxDurationMs
  }

  fun setMaxDx(deltaX: Float) = apply {
    maxDeltaX = deltaX
  }

  fun setMaxDy(deltaY: Float) = apply {
    maxDeltaY = deltaY
  }

  fun setMaxDist(maxDist: Float) = apply {
    maxDistSq = maxDist * maxDist
  }

  fun setMinNumberOfPointers(minNumberOfPointers: Int) = apply {
    this.minNumberOfPointers = minNumberOfPointers
  }

  private fun startTap() {
    if (handler == null) {
      handler = Handler(Looper.getMainLooper()) // TODO: lazy init (handle else branch correctly)
    } else {
      handler!!.removeCallbacksAndMessages(null)
    }
    handler!!.postDelayed(failDelayed, maxDurationMs)
  }

  private fun endTap() {
    if (handler == null) {
      handler = Handler(Looper.getMainLooper())
    } else {
      handler!!.removeCallbacksAndMessages(null)
    }
    if (++tapsSoFar == numberOfTaps && currentMaxNumberOfPointers >= minNumberOfPointers) {
      activate()
    } else {
      handler!!.postDelayed(failDelayed, maxDelayMs)
    }
  }

  private fun shouldFail(): Boolean {
    val dx = lastX - startX + offsetX
    if (maxDeltaX != MAX_VALUE_IGNORE && abs(dx) > maxDeltaX) {
      return true
    }
    val dy = lastY - startY + offsetY
    if (maxDeltaY != MAX_VALUE_IGNORE && abs(dy) > maxDeltaY) {
      return true
    }
    val dist = dy * dy + dx * dx
    return maxDistSq != MAX_VALUE_IGNORE && dist > maxDistSq
  }

  override fun onHandle(event: MotionEvent, sourceEvent: MotionEvent) {
    if (!shouldActivateWithMouse(sourceEvent)) {
      return
    }

    val state = state
    val action = sourceEvent.actionMasked
    if (state == STATE_UNDETERMINED) {
      offsetX = 0f
      offsetY = 0f
      startX = getLastPointerX(sourceEvent, true)
      startY = getLastPointerY(sourceEvent, true)
    }
    if (action == MotionEvent.ACTION_POINTER_UP || action == MotionEvent.ACTION_POINTER_DOWN) {
      offsetX += lastX - startX
      offsetY += lastY - startY
      lastX = getLastPointerX(sourceEvent, true)
      lastY = getLastPointerY(sourceEvent, true)
      startX = lastX
      startY = lastY
    } else {
      lastX = getLastPointerX(sourceEvent, true)
      lastY = getLastPointerY(sourceEvent, true)
    }
    if (currentMaxNumberOfPointers < sourceEvent.pointerCount) {
      currentMaxNumberOfPointers = sourceEvent.pointerCount
    }
    if (shouldFail()) {
      fail()
    } else if (state == STATE_UNDETERMINED) {
      if (action == MotionEvent.ACTION_DOWN || action == MotionEvent.ACTION_BUTTON_PRESS) {
        begin()
      }
      startTap()
    } else if (state == STATE_BEGAN) {
      if (action == MotionEvent.ACTION_UP || action == MotionEvent.ACTION_BUTTON_RELEASE) {
        endTap()
      } else if (action == MotionEvent.ACTION_DOWN || action == MotionEvent.ACTION_BUTTON_PRESS) {
        startTap()
      }
    }
  }

  override fun activate(force: Boolean) {
    super.activate(force)
    end()
  }

  override fun onCancel() {
    handler?.removeCallbacksAndMessages(null)
  }

  override fun onReset() {
    tapsSoFar = 0
    currentMaxNumberOfPointers = 0
    handler?.removeCallbacksAndMessages(null)
  }

  class Factory : GestureHandler.Factory<TapGestureHandler>() {
    override val type = TapGestureHandler::class.java
    override val name = "TapGestureHandler"

    override fun create(context: Context?): TapGestureHandler {
      return TapGestureHandler()
    }

    override fun configure(handler: TapGestureHandler, config: ReadableMap) {
      super.configure(handler, config)
      if (config.hasKey(KEY_TAP_NUMBER_OF_TAPS)) {
        handler.setNumberOfTaps(config.getInt(KEY_TAP_NUMBER_OF_TAPS))
      }
      if (config.hasKey(KEY_TAP_MAX_DURATION_MS)) {
        handler.setMaxDurationMs(config.getInt(KEY_TAP_MAX_DURATION_MS).toLong())
      }
      if (config.hasKey(KEY_TAP_MAX_DELAY_MS)) {
        handler.setMaxDelayMs(config.getInt(KEY_TAP_MAX_DELAY_MS).toLong())
      }
      if (config.hasKey(KEY_TAP_MAX_DELTA_X)) {
        handler.setMaxDx(PixelUtil.toPixelFromDIP(config.getDouble(KEY_TAP_MAX_DELTA_X)))
      }
      if (config.hasKey(KEY_TAP_MAX_DELTA_Y)) {
        handler.setMaxDy(PixelUtil.toPixelFromDIP(config.getDouble(KEY_TAP_MAX_DELTA_Y)))
      }
      if (config.hasKey(KEY_TAP_MAX_DIST)) {
        handler.setMaxDist(PixelUtil.toPixelFromDIP(config.getDouble(KEY_TAP_MAX_DIST)))
      }
      if (config.hasKey(KEY_TAP_MIN_POINTERS)) {
        handler.setMinNumberOfPointers(config.getInt(KEY_TAP_MIN_POINTERS))
      }
    }

    override fun createEventBuilder(handler: TapGestureHandler) = TapGestureHandlerEventDataBuilder(handler)

    companion object {
      private const val KEY_TAP_NUMBER_OF_TAPS = "numberOfTaps"
      private const val KEY_TAP_MAX_DURATION_MS = "maxDurationMs"
      private const val KEY_TAP_MAX_DELAY_MS = "maxDelayMs"
      private const val KEY_TAP_MAX_DELTA_X = "maxDeltaX"
      private const val KEY_TAP_MAX_DELTA_Y = "maxDeltaY"
      private const val KEY_TAP_MAX_DIST = "maxDist"
      private const val KEY_TAP_MIN_POINTERS = "minPointers"
    }
  }

  companion object {
    private const val MAX_VALUE_IGNORE = Float.MIN_VALUE
    private const val DEFAULT_MAX_DURATION_MS: Long = 500
    private const val DEFAULT_MAX_DELAY_MS: Long = 200
    private const val DEFAULT_NUMBER_OF_TAPS = 1
    private const val DEFAULT_MIN_NUMBER_OF_POINTERS = 1
  }
}
