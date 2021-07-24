package com.swmansion.gesturehandler

import android.view.MotionEvent
import com.swmansion.gesturehandler.RotationGestureDetector.OnRotationGestureListener
import kotlin.math.abs

class RotationGestureHandler : GestureHandler<RotationGestureHandler>() {
  private var mRotationGestureDetector: RotationGestureDetector? = null
  var rotation = 0.0
    private set
  var velocity = 0.0
    private set
  private val mGestureListener: OnRotationGestureListener = object : OnRotationGestureListener {
    override fun onRotation(detector: RotationGestureDetector): Boolean {
      val prevRotation: Double = rotation
      rotation += detector.rotation
      val delta = detector.timeDelta
      if (delta > 0) {
        velocity = (rotation - prevRotation) / delta
      }
      if (abs(rotation) >= ROTATION_RECOGNITION_THRESHOLD && state == STATE_BEGAN) {
        activate()
      }
      return true
    }

    override fun onRotationBegin(detector: RotationGestureDetector) = true

    override fun onRotationEnd(detector: RotationGestureDetector) {
      end()
    }
  }

  init {
    setShouldCancelWhenOutside(false)
  }

  override fun onHandle(event: MotionEvent) {
    val state = state
    if (state == STATE_UNDETERMINED) {
      velocity = 0.0
      rotation = 0.0
      mRotationGestureDetector = RotationGestureDetector(mGestureListener)
      begin()
    }
    mRotationGestureDetector?.onTouchEvent(event)
    if (event.actionMasked == MotionEvent.ACTION_UP) {
      if (state == STATE_ACTIVE) {
        end()
      } else {
        fail()
      }
    }
  }

  override fun onReset() {
    mRotationGestureDetector = null
    velocity = 0.0
    rotation = 0.0
  }

  val anchorX: Float
    get() = mRotationGestureDetector?.anchorX ?: Float.NaN
  val anchorY: Float
    get() = mRotationGestureDetector?.anchorY ?: Float.NaN

  companion object {
    private const val ROTATION_RECOGNITION_THRESHOLD = Math.PI / 36.0 // 5 deg in radians
  }
}