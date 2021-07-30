package com.swmansion.gesturehandler

import android.view.MotionEvent
import kotlin.math.atan2

class RotationGestureDetector(private val mListener: OnRotationGestureListener?) {
  interface OnRotationGestureListener {
    fun onRotation(detector: RotationGestureDetector): Boolean
    fun onRotationBegin(detector: RotationGestureDetector): Boolean
    fun onRotationEnd(detector: RotationGestureDetector)
  }

  private var mCurrTime: Long = 0
  private var mPrevTime: Long = 0
  private var mPrevAngle = 0.0

  /**
   * Returns rotation in radians since the previous rotation event.
   *
   * @return current rotation step in radians.
   */
  var rotation = 0.0
    private set

  /**
   * Returns X coordinate of the rotation anchor point relative to the view that the provided motion
   * event coordinates (usually relative to the view event was sent to).
   *
   * @return X coordinate of the rotation anchor point
   */
  var anchorX = 0f
    private set

  /**
   * Returns Y coordinate of the rotation anchor point relative to the view that the provided motion
   * event coordinates (usually relative to the view event was sent to).
   *
   * @return Y coordinate of the rotation anchor point
   */
  var anchorY = 0f
    private set
  private var mInProgress = false
  private val mPointerIds = IntArray(2)
  private fun updateCurrent(event: MotionEvent) {
    mPrevTime = mCurrTime
    mCurrTime = event.eventTime
    val firstPointerIndex = event.findPointerIndex(mPointerIds[0])
    val secondPointerIndex = event.findPointerIndex(mPointerIds[1])
    val firstPtX = event.getX(firstPointerIndex)
    val firstPtY = event.getY(firstPointerIndex)
    val secondPtX = event.getX(secondPointerIndex)
    val secondPtY = event.getY(secondPointerIndex)
    val vectorX = secondPtX - firstPtX
    val vectorY = secondPtY - firstPtY
    anchorX = (firstPtX + secondPtX) * 0.5f
    anchorY = (firstPtY + secondPtY) * 0.5f

    // Angle diff should be positive when rotating in clockwise direction
    val angle = -atan2(vectorY.toDouble(), vectorX.toDouble())
    rotation = if (java.lang.Double.isNaN(mPrevAngle)) {
      0.0
    } else mPrevAngle - angle

    mPrevAngle = angle
    if (rotation > Math.PI) {
      rotation -= Math.PI
    } else if (rotation < -Math.PI) {
      rotation += Math.PI
    }
    if (rotation > Math.PI / 2.0) {
      rotation -= Math.PI
    } else if (rotation < -Math.PI / 2.0) {
      rotation += Math.PI
    }
  }

  private fun finish() {
    if (mInProgress) {
      mInProgress = false
      mListener?.onRotationEnd(this)
    }
  }

  fun onTouchEvent(event: MotionEvent): Boolean {
    when (event.actionMasked) {
      MotionEvent.ACTION_DOWN -> {
        mInProgress = false
        mPointerIds[0] = event.getPointerId(event.actionIndex)
        mPointerIds[1] = MotionEvent.INVALID_POINTER_ID
      }
      MotionEvent.ACTION_POINTER_DOWN -> if (!mInProgress) {
        mPointerIds[1] = event.getPointerId(event.actionIndex)
        mInProgress = true
        mPrevTime = event.eventTime
        mPrevAngle = Double.NaN
        updateCurrent(event)
        mListener?.onRotationBegin(this)
      }
      MotionEvent.ACTION_MOVE -> if (mInProgress) {
        updateCurrent(event)
        mListener?.onRotation(this)
      }
      MotionEvent.ACTION_POINTER_UP -> if (mInProgress) {
        val pointerId = event.getPointerId(event.actionIndex)
        if (pointerId == mPointerIds[0] || pointerId == mPointerIds[1]) {
          // One of the key pointer has been lifted up, we have to end the gesture
          finish()
        }
      }
      MotionEvent.ACTION_UP -> finish()
    }
    return true
  }

  /**
   * Return the time difference in milliseconds between the previous
   * accepted rotation event and the current rotation event.
   *
   * @return Time difference since the last rotation event in milliseconds.
   */
  val timeDelta: Long
    get() = mCurrTime - mPrevTime
}
