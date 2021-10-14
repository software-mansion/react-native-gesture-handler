package com.swmansion.gesturehandler

import android.view.MotionEvent
import android.view.ScaleGestureDetector
import android.view.ScaleGestureDetector.OnScaleGestureListener
import android.view.ViewConfiguration
import kotlin.math.abs

class PinchGestureHandler : GestureHandler<PinchGestureHandler>() {
  var endOnFingerRelease = false

  var scale = 0.0
    private set
  var velocity = 0.0
    private set
  val focalPointX: Float
    get() = scaleGestureDetector?.focusX ?: Float.NaN
  val focalPointY: Float
    get() = scaleGestureDetector?.focusY ?: Float.NaN

  private var scaleGestureDetector: ScaleGestureDetector? = null
  private var startingSpan = 0f
  private var spanSlop = 0f
  private val gestureListener: OnScaleGestureListener = object : OnScaleGestureListener {
    override fun onScale(detector: ScaleGestureDetector): Boolean {
      val prevScaleFactor: Double = scale
      scale *= detector.scaleFactor.toDouble()
      val delta = detector.timeDelta
      if (delta > 0) {
        velocity = (scale - prevScaleFactor) / delta
      }
      if (abs(startingSpan - detector.currentSpan) >= spanSlop
        && state == STATE_BEGAN) {
        activate()
      }
      return true
    }

    init {
      setShouldCancelWhenOutside(false)
    }

    override fun onScaleBegin(detector: ScaleGestureDetector): Boolean {
      startingSpan = detector.currentSpan
      return true
    }

    override fun onScaleEnd(detector: ScaleGestureDetector) {
      // ScaleGestureDetector thinks that when fingers are 27mm away that's a sufficiently good
      // reason to trigger this method giving us no other choice but to ignore it completely.
    }
  }

  override fun onHandle(event: MotionEvent) {
    if (state == STATE_UNDETERMINED && event.pointerCount >= 2) {
      val context = view!!.context
      velocity = 0.0
      scale = 1.0
      scaleGestureDetector = ScaleGestureDetector(context, gestureListener)
      val configuration = ViewConfiguration.get(context)
      spanSlop = configuration.scaledTouchSlop.toFloat()
      begin()
    }
    if (state == STATE_BEGAN || state == STATE_ACTIVE) {
      scaleGestureDetector?.onTouchEvent(event)
    }
    var activePointers = event.pointerCount
    if (event.actionMasked == MotionEvent.ACTION_POINTER_UP || event.action == MotionEvent.ACTION_UP) {
      activePointers -= 1
    }

    if (state == STATE_ACTIVE) {
      if ((endOnFingerRelease && activePointers < 2) || activePointers == 0) {
        end()
      }
    } else if (event.actionMasked == MotionEvent.ACTION_UP) {
      fail()
    }
  }

  override fun needsToPreventOtherFromActivating(handler: GestureHandler<*>): Boolean {
    if (handler is NativeViewGestureHandler) {
      return true
    }

    return super.needsToPreventOtherFromActivating(handler)
  }

  override fun onReset() {
    scaleGestureDetector = null
    velocity = 0.0
    scale = 1.0
  }
}
