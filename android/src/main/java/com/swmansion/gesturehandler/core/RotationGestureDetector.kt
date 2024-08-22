package com.swmansion.gesturehandler.core

import android.util.Log
import android.view.MotionEvent
import kotlin.math.atan2

private const val ENABLE_LOGS = false
private const val BASE_LOG_TAG = "RotationGestureHandler"
private fun localLog(message: String, isFrequent: Boolean = false) {
  if (!ENABLE_LOGS) return
  Log.d(
    "$BASE_LOG_TAG | ${if (isFrequent) "FREQUENT" else "NON_FREQUENT"}",
    message
  )
}

class RotationGestureDetector(
  private val gestureListener: OnRotationGestureListener?,
  private val secondPointerLiftFinishesGesture: Boolean = DEFAULT_SECOND_POINTER_LIFT_FINISHES_GESTURE
) {
  companion object {
    const val DEFAULT_SECOND_POINTER_LIFT_FINISHES_GESTURE = true
  }

  interface OnRotationGestureListener {
    fun onRotation(detector: RotationGestureDetector): Boolean
    fun onRotationBegin(detector: RotationGestureDetector): Boolean
    fun onRotationEnd(detector: RotationGestureDetector)
  }

  private var currentTime = 0L
  private var previousTime = 0L
  private var previousAngle = 0.0

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

  /**
   * Return the time difference in milliseconds between the previous
   * accepted rotation event and the current rotation event.
   *
   * @return Time difference since the last rotation event in milliseconds.
   */
  val timeDelta: Long
    get() = currentTime - previousTime

  private var isInProgress = false
  private val pointerIds = IntArray(2)

  private fun updateCurrent(event: MotionEvent) {
    localLog("updateCurrent", true)

    previousTime = currentTime
    currentTime = event.eventTime

    val firstPointerIndex = event.findPointerIndex(pointerIds[0])
    val secondPointerIndex = event.findPointerIndex(pointerIds[1])

    if (
      firstPointerIndex == MotionEvent.INVALID_POINTER_ID ||
      secondPointerIndex == MotionEvent.INVALID_POINTER_ID
    ) { return }

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

    unpause(angle)

    rotation = if (previousAngle.isNaN()) {
      0.0
    } else previousAngle - angle

    localLog(
      "updateCurrent | rotation: $rotation, angle: $angle, previousAngle: $previousAngle",
      true
    )

    previousAngle = angle
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

  /**
   * Gesture may be paused when second Pointer lifts
   * with secondPointerLiftFinishesGesture set to `false`
   *
   * Then Detector waits for a new second Pointer to arrive to continue Handling
   * (last Pointer Lifting still finishes the Gesture)
   *
   * @see secondPointerLiftFinishesGesture
   * @see pause
   * @see unpause
   */
  private var isPaused = false
  private fun pause() {
    localLog(".pause() requested", true)
    if (!isPaused) {
      isPaused = true
      localLog(".pause() fulfilled")
    }
  }
  private fun unpause(eventAngle: Double) {
    localLog(".unpause(eventAngle: $eventAngle) requested", true)
    if (isPaused) {
      previousAngle = eventAngle
      isPaused = false
      localLog(".unpause(eventAngle: $eventAngle) fulfilled")
    }
  }

  private fun finish() {
    if (isInProgress) {
      isPaused = false
      isInProgress = false
      gestureListener?.onRotationEnd(this)
    }
  }

  fun onTouchEvent(event: MotionEvent): Boolean {
    fun getLogInfo(): String {
      val firstPointerIndex = event.findPointerIndex(pointerIds[0])
      val secondPointerIndex = event.findPointerIndex(pointerIds[1])

      return """
        pointerIds[0]: ${pointerIds[0]}, pointerIds[1]: ${pointerIds[1]}
        firstPointerIndex: $firstPointerIndex, secondPointerIndex: $secondPointerIndex
        isInProgress: $isInProgress, isPaused: $isPaused
        action: ${event.action}, actionIndex: ${event.actionIndex} pointerCount: ${event.pointerCount}
        rotation: $rotation, previousAngle: $previousAngle
        event: $event
      """.trimIndent()
    }
    localLog("onTouchEvent START | ${getLogInfo()}", true)

    when (event.actionMasked) {
      MotionEvent.ACTION_DOWN -> {
        localLog("ActionDown START | ${getLogInfo()}")
        isInProgress = false
        pointerIds[0] = event.getPointerId(event.actionIndex)
        pointerIds[1] = MotionEvent.INVALID_POINTER_ID
        localLog("ActionDown END | ${getLogInfo()}")
      }
      MotionEvent.ACTION_POINTER_DOWN -> {
        localLog("ActionPointerDown START | ${getLogInfo()}")
        if (!isInProgress) {
          pointerIds[1] = event.getPointerId(event.actionIndex)
          isInProgress = true
          previousTime = event.eventTime
          previousAngle = Double.NaN
          updateCurrent(event)
          gestureListener?.onRotationBegin(this)
        }
        localLog("ActionPointerDown END | ${getLogInfo()}")
      }
      MotionEvent.ACTION_MOVE -> if (isInProgress) {
        localLog("ActionMove START | ${getLogInfo()}", true)
        val firstPointerIndex = event.findPointerIndex(pointerIds[0])
        val secondPointerIndex = event.findPointerIndex(pointerIds[1])

        if (
          firstPointerIndex != MotionEvent.INVALID_POINTER_ID &&
          secondPointerIndex != MotionEvent.INVALID_POINTER_ID
        ) {
          updateCurrent(event)
          gestureListener?.onRotation(this)
        }
        localLog("ActionMove END | ${getLogInfo()}", true)
      }
      MotionEvent.ACTION_POINTER_UP -> {
        localLog("ActionPointerUp START | ${getLogInfo()}")
        if (isInProgress) {
          val pointerId = event.getPointerId(event.actionIndex)
          if (pointerId == pointerIds[0] || pointerId == pointerIds[1]) {
            // One of the key Pointers has been lifted up, we have to pause or finish the Gesture
            if (secondPointerLiftFinishesGesture) finish()
            else pause()
          }
        }
        localLog("ActionPointerUp END | ${getLogInfo()}")
      }
      MotionEvent.ACTION_UP -> {
        localLog("ActionUp START | ${getLogInfo()}")
        finish()
        localLog("ActionUp END | ${getLogInfo()}")
      }
    }
    return true
  }
}
