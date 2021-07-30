package com.swmansion.gesturehandler

import android.view.MotionEvent
import android.view.ScaleGestureDetector
import android.view.ScaleGestureDetector.OnScaleGestureListener
import android.view.ViewConfiguration
import kotlin.math.abs

class PinchGestureHandler : GestureHandler<PinchGestureHandler>() {
  private var mScaleGestureDetector: ScaleGestureDetector? = null
  var scale = 0.0
    private set
  var velocity = 0.0
    private set
  private var mStartingSpan = 0f
  private var mSpanSlop = 0f
  private val mGestureListener: OnScaleGestureListener = object : OnScaleGestureListener {
    override fun onScale(detector: ScaleGestureDetector): Boolean {
      val prevScaleFactor: Double = scale
      scale *= detector.scaleFactor.toDouble()
      val delta = detector.timeDelta
      if (delta > 0) {
        velocity = (scale - prevScaleFactor) / delta
      }
      if (abs(mStartingSpan - detector.currentSpan) >= mSpanSlop
        && state == STATE_BEGAN) {
        activate()
      }
      return true
    }

    override fun onScaleBegin(detector: ScaleGestureDetector): Boolean {
      mStartingSpan = detector.currentSpan
      return true
    }

    override fun onScaleEnd(detector: ScaleGestureDetector) {
      // ScaleGestureDetector thinks that when fingers are 27mm away that's a sufficiently good
      // reason to trigger this method giving us no other choice but to ignore it completely.
    }
  }

  override fun onHandle(event: MotionEvent) {
    if (state == STATE_UNDETERMINED) {
      val context = view!!.context
      velocity = 0.0
      scale = 1.0
      mScaleGestureDetector = ScaleGestureDetector(context, mGestureListener)
      val configuration = ViewConfiguration.get(context)
      mSpanSlop = configuration.scaledTouchSlop.toFloat()
      begin()
    }
    if (mScaleGestureDetector != null) {
      mScaleGestureDetector!!.onTouchEvent(event)
    }
    var activePointers = event.pointerCount
    if (event.actionMasked == MotionEvent.ACTION_POINTER_UP) {
      activePointers -= 1
    }
    if (state == STATE_ACTIVE && activePointers < 2) {
      end()
    } else if (event.actionMasked == MotionEvent.ACTION_UP) {
      fail()
    }
  }

  override fun onReset() {
    mScaleGestureDetector = null
    velocity = 0.0
    scale = 1.0
  }

  val focalPointX: Float
    get() = if (mScaleGestureDetector == null) {
      Float.NaN
    } else mScaleGestureDetector!!.focusX
  val focalPointY: Float
    get() = if (mScaleGestureDetector == null) {
      Float.NaN
    } else mScaleGestureDetector!!.focusY

  init {
    setShouldCancelWhenOutside(false)
  }
}
