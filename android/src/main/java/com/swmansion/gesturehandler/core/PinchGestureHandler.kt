package com.swmansion.gesturehandler.core

import android.view.MotionEvent
import kotlin.math.max
import kotlin.math.min
import kotlin.math.sqrt

class PinchGestureHandler : GestureHandler<PinchGestureHandler>() {
  var scale = 0.0
    private set
  var velocity = 0.0
    private set
  var focalPointX: Float = Float.NaN
    private set
  var focalPointY: Float = Float.NaN
    private set

  private var startingSpan = 0f
  private var time: Long = 0L

  // Get average position X within the view.
  private fun getX(event: MotionEvent): Float {
    var total: Float = 0f
    var pointers: Int = event.pointerCount - 1
    for (i in 0..pointers) {
      total += event.getX(event.getPointerId(i))
    }
    return total / (pointers + 1)
  }
  // Get average position Y within the view.
  private fun getY(event: MotionEvent): Float {
    var total: Float = 0f
    var pointers: Int = event.pointerCount - 1
    for (i in 0..pointers) {
      total += event.getY(event.getPointerId(i))
    }
    return total / (pointers + 1)
  }

  // Calculate hypothenuse of touches bounding box.
  private fun getSpan(event: MotionEvent): Float {
    var minX: Float = Float.MAX_VALUE
    var minY: Float = Float.MAX_VALUE
    var maxX: Float = Float.MIN_VALUE
    var maxY: Float = Float.MIN_VALUE
    var pointers: Int = event.pointerCount - 1
    for (i in 0..pointers) {
      var id = event.getPointerId(i)
      var x: Float = event.getX(id)
      var y: Float = event.getY(id)
      minX = min(minX, x)
      maxX = max(maxX, x)
      minY = min(minY, y)
      maxY = max(maxY, y)
    }
    var spanX: Float = maxX - minX
    var spanY: Float = maxY - minY
    return sqrt(spanX * spanX + spanY * spanY)
  }

  override fun onHandle(event: MotionEvent, sourceEvent: MotionEvent) {
    var activePointers = event.pointerCount
    if (event.actionMasked == MotionEvent.ACTION_POINTER_UP) {
      activePointers -= 1
    }

    if (activePointers >= 2) {
      focalPointX = getX(event)
      focalPointY = getY(event)
      var prevTime: Long = time
      time = event.getEventTime()

      if (state == STATE_UNDETERMINED) {
        velocity = 0.0
        scale = 1.0
        startingSpan = getSpan(event)
        begin()
      } else {
        var lastSpan: Float = getSpan(event)
        var prevScale: Double = scale
        scale = (lastSpan / startingSpan).toString().toDouble()
        var delta: Long = time - prevTime
        if (delta > 0) {
          velocity = (scale - prevScale) / delta
        }

        if (state == STATE_BEGAN) {
          activate()
        }
      }
    }

    if (state == STATE_ACTIVE && activePointers < 2) {
      end()
    } else if (event.actionMasked == MotionEvent.ACTION_UP) {
      fail()
    }
  }

  override fun activate(force: Boolean) {
    // reset scale if the handler has not yet activated
    if (state != STATE_ACTIVE) {
      resetProgress()
    }
    super.activate(force)
  }

  override fun onReset() {
    focalPointX = Float.NaN
    focalPointY = Float.NaN
    resetProgress()
  }

  override fun resetProgress() {
    velocity = 0.0
    scale = 1.0
  }
}
