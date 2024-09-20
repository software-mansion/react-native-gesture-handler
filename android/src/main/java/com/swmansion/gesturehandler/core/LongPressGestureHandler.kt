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
  private var currentPointers = 0

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

  private fun getAverageCoords(ev: MotionEvent, excludePointer: Boolean = false): Pair<Float, Float> {
    if (!excludePointer) {
      val x = (0 until ev.pointerCount).map { ev.getX(it) }.average().toFloat()
      val y = (0 until ev.pointerCount).map { ev.getY(it) }.average().toFloat()

      return Pair(x, y)
    }

    var sumX = 0f
    var sumY = 0f

    for (i in 0 until ev.pointerCount) {
      if (i == ev.actionIndex) {
        continue
      }

      sumX += ev.getX(i)
      sumY += ev.getY(i)
    }

    val x = sumX / (ev.pointerCount - 1)
    val y = sumY / (ev.pointerCount - 1)

    return Pair(x, y)
  }

  override fun onHandle(event: MotionEvent, sourceEvent: MotionEvent) {
    if (!shouldActivateWithMouse(sourceEvent)) {
      return
    }

    if (state == STATE_UNDETERMINED) {
      previousTime = SystemClock.uptimeMillis()
      startTime = previousTime
      begin()

      val (x, y) = getAverageCoords(sourceEvent)
      startX = x
      startY = y

      currentPointers++
    }

    if (sourceEvent.actionMasked == MotionEvent.ACTION_POINTER_DOWN) {
      currentPointers++

      val (x, y) = getAverageCoords(sourceEvent)
      startX = x
      startY = y

      if (currentPointers > numberOfPointersRequired) {
        fail()
        currentPointers = 0
      }
    }

    if (state == STATE_BEGAN && currentPointers == numberOfPointersRequired && (sourceEvent.actionMasked == MotionEvent.ACTION_DOWN || sourceEvent.actionMasked == MotionEvent.ACTION_POINTER_DOWN)) {
      handler = Handler(Looper.getMainLooper())
      if (minDurationMs > 0) {
        handler!!.postDelayed({ activate() }, minDurationMs)
      } else if (minDurationMs == 0L) {
        activate()
      }
    }
    if (sourceEvent.actionMasked == MotionEvent.ACTION_UP || sourceEvent.actionMasked == MotionEvent.ACTION_BUTTON_RELEASE) {
      currentPointers--

      handler?.let {
        it.removeCallbacksAndMessages(null)
        handler = null
      }

      if (state == STATE_ACTIVE) {
        end()
      } else {
        fail()
      }
    } else if (sourceEvent.actionMasked == MotionEvent.ACTION_POINTER_UP) {
      currentPointers--

      if (currentPointers < numberOfPointersRequired && state != STATE_ACTIVE) {
        fail()
        currentPointers = 0
      } else {
        val (x, y) = getAverageCoords(sourceEvent, true)
        startX = x
        startY = y
      }
    } else {
      // calculate distance from start
      val (x, y) = getAverageCoords(sourceEvent)

      val deltaX = x - startX
      val deltaY = y - startY
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

  override fun onReset() {
    super.onReset()
    currentPointers = 0
  }

  companion object {
    private const val DEFAULT_MIN_DURATION_MS: Long = 500
    private const val DEFAULT_MAX_DIST_DP = 10f
  }
}
