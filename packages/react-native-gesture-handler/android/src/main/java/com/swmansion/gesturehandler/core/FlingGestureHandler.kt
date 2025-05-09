package com.swmansion.gesturehandler.core

import android.os.Handler
import android.os.Looper
import android.view.MotionEvent
import android.view.VelocityTracker

class FlingGestureHandler : GestureHandler<FlingGestureHandler>() {
  var numberOfPointersRequired = DEFAULT_NUMBER_OF_TOUCHES_REQUIRED
  var direction = DEFAULT_DIRECTION

  private val maxDurationMs = DEFAULT_MAX_DURATION_MS
  private val minVelocity = DEFAULT_MIN_VELOCITY
  private var handler: Handler? = null
  private var maxNumberOfPointersSimultaneously = 0
  private val failDelayed = Runnable { fail() }
  private var velocityTracker: VelocityTracker? = null

  override fun resetConfig() {
    super.resetConfig()
    numberOfPointersRequired = DEFAULT_NUMBER_OF_TOUCHES_REQUIRED
    direction = DEFAULT_DIRECTION
  }

  private fun startFling(event: MotionEvent) {
    velocityTracker = VelocityTracker.obtain()
    begin()
    maxNumberOfPointersSimultaneously = 1
    if (handler == null) {
      handler = Handler(Looper.getMainLooper()) // lazy delegate?
    } else {
      handler!!.removeCallbacksAndMessages(null)
    }
    handler!!.postDelayed(failDelayed, maxDurationMs)
  }

  private fun tryEndFling(event: MotionEvent): Boolean {
    addVelocityMovement(velocityTracker, event)

    val velocityVector = Vector.fromVelocity(velocityTracker!!)

    fun getVelocityAlignment(direction: Int, maxDeviationCosine: Double): Boolean = (
      (this.direction and direction) == direction &&
        velocityVector.isSimilar(Vector.fromDirection(direction), maxDeviationCosine)
      )

    val axialAlignmentsList = arrayOf(
      DIRECTION_LEFT,
      DIRECTION_RIGHT,
      DIRECTION_UP,
      DIRECTION_DOWN,
    ).map { direction -> getVelocityAlignment(direction, MAX_AXIAL_DEVIATION) }

    val diagonalAlignmentsList = arrayOf(
      DiagonalDirections.DIRECTION_RIGHT_UP,
      DiagonalDirections.DIRECTION_RIGHT_DOWN,
      DiagonalDirections.DIRECTION_LEFT_UP,
      DiagonalDirections.DIRECTION_LEFT_DOWN,
    ).map { direction -> getVelocityAlignment(direction, MAX_DIAGONAL_DEVIATION) }

    val isAligned = axialAlignmentsList.any { it } or diagonalAlignmentsList.any { it }
    val isFast = velocityVector.magnitude > this.minVelocity

    return if (
      maxNumberOfPointersSimultaneously == numberOfPointersRequired &&
      isAligned &&
      isFast
    ) {
      handler!!.removeCallbacksAndMessages(null)
      activate()
      true
    } else {
      false
    }
  }
  override fun activate(force: Boolean) {
    super.activate(force)
    end()
  }

  private fun endFling(event: MotionEvent) {
    if (!tryEndFling(event)) {
      fail()
    }
  }

  override fun onHandle(event: MotionEvent, sourceEvent: MotionEvent) {
    if (!shouldActivateWithMouse(sourceEvent)) {
      return
    }

    val state = state
    if (state == STATE_UNDETERMINED) {
      startFling(sourceEvent)
    }
    if (state == STATE_BEGAN) {
      tryEndFling(sourceEvent)
      if (sourceEvent.pointerCount > maxNumberOfPointersSimultaneously) {
        maxNumberOfPointersSimultaneously = sourceEvent.pointerCount
      }
      val action = sourceEvent.actionMasked
      if (action == MotionEvent.ACTION_UP) {
        endFling(sourceEvent)
      }
    }
  }

  override fun onCancel() {
    handler?.removeCallbacksAndMessages(null)
  }

  override fun onReset() {
    velocityTracker?.recycle()
    velocityTracker = null
    handler?.removeCallbacksAndMessages(null)
  }

  private fun addVelocityMovement(tracker: VelocityTracker?, event: MotionEvent) {
    val offsetX = event.rawX - event.x
    val offsetY = event.rawY - event.y
    event.offsetLocation(offsetX, offsetY)
    tracker!!.addMovement(event)
    event.offsetLocation(-offsetX, -offsetY)
  }

  companion object {
    private const val DEFAULT_MAX_DURATION_MS: Long = 800
    private const val DEFAULT_MIN_VELOCITY: Long = 2000
    private const val DEFAULT_ALIGNMENT_CONE: Double = 30.0
    private const val DEFAULT_DIRECTION = DIRECTION_RIGHT
    private const val DEFAULT_NUMBER_OF_TOUCHES_REQUIRED = 1

    private val MAX_AXIAL_DEVIATION: Double =
      GestureUtils.coneToDeviation(DEFAULT_ALIGNMENT_CONE)
    private val MAX_DIAGONAL_DEVIATION: Double =
      GestureUtils.coneToDeviation(90 - DEFAULT_ALIGNMENT_CONE)
  }
}
