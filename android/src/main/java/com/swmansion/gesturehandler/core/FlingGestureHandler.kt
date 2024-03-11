package com.swmansion.gesturehandler.core

import android.os.Handler
import android.os.Looper
import android.view.MotionEvent
import android.view.VelocityTracker
import kotlin.math.hypot

class FlingGestureHandler : GestureHandler<FlingGestureHandler>() {
  var numberOfPointersRequired = DEFAULT_NUMBER_OF_TOUCHES_REQUIRED
  var direction = DEFAULT_DIRECTION

  private val maxDurationMs = DEFAULT_MAX_DURATION_MS
  private val minVelocity = DEFAULT_MIN_ACCEPTABLE_DELTA
  private val minDirectionAlignment = DEFAULT_MIN_DIRECTION_ALIGNMENT
  private var handler: Handler? = null
  private var maxNumberOfPointersSimultaneously = 0
  private val failDelayed = Runnable { fail() }

  override fun resetConfig() {
    super.resetConfig()
    numberOfPointersRequired = DEFAULT_NUMBER_OF_TOUCHES_REQUIRED
    direction = DEFAULT_DIRECTION
  }

  private fun startFling(event: MotionEvent) {
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
    data class SimpleVector(val x: Double, val y: Double)

    fun toSafeNumber(unsafe: Double): Double = if (unsafe.isFinite()) unsafe else 0.0

    fun toUnitVector(vec: SimpleVector): SimpleVector {
      val magnitude = hypot(vec.x, vec.y)
      // toSafeNumber protects against division by zero
      return SimpleVector(
        toSafeNumber(vec.x / magnitude),
        toSafeNumber(vec.y / magnitude)
      )
    }

    fun compareSimilarity(
      vecA: SimpleVector,
      vecB: SimpleVector
    ): Double {
      val unitA = toUnitVector(vecA)
      val unitB = toUnitVector(vecB)
      // returns scalar on range from -1.0 to 1.0
      return unitA.x * unitB.x + unitA.y * unitB.y
    }

    fun compareAlignment(
      vec: SimpleVector,
      directionVec: SimpleVector,
      direction: Int
    ): Boolean =
      compareSimilarity(vec, directionVec) > minDirectionAlignment &&
        (this.direction and direction != 0)

    val velocityTracker = VelocityTracker.obtain()
    addVelocityMovement(velocityTracker, event)
    velocityTracker!!.computeCurrentVelocity(1000)

    val velocityVector = SimpleVector(
      velocityTracker.xVelocity.toDouble(),
      velocityTracker.yVelocity.toDouble()
    )

    val alignmentList = arrayOf(
      compareAlignment(velocityVector, SimpleVector(-1.0, 0.0), DIRECTION_LEFT),
      compareAlignment(velocityVector, SimpleVector(1.0, 0.0), DIRECTION_RIGHT),
      compareAlignment(velocityVector, SimpleVector(0.0, -1.0), DIRECTION_UP),
      compareAlignment(velocityVector, SimpleVector(0.0, 1.0), DIRECTION_DOWN)
    )

    velocityTracker.recycle()

    val totalVelocity = hypot(velocityVector.x, velocityVector.y)

    val isAligned = alignmentList.reduce { any, element -> any or element }
    val isFast = totalVelocity > this.minVelocity

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
    private const val DEFAULT_MIN_ACCEPTABLE_DELTA: Long = 2000
    private const val DEFAULT_MIN_DIRECTION_ALIGNMENT: Double = 0.75
    private const val DEFAULT_DIRECTION = DIRECTION_RIGHT
    private const val DEFAULT_NUMBER_OF_TOUCHES_REQUIRED = 1
  }
}
