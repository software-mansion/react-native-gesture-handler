package com.swmansion.gesturehandler.core

import android.os.Handler
import android.os.Looper
import android.view.MotionEvent
import android.view.VelocityTracker
import com.swmansion.gesturehandler.core.GestureHandler.Companion
import kotlin.math.hypot

class Vector {
  var x: Double = 0.0
  var y: Double = 0.0
  var uX: Double = 0.0
  var uY: Double = 0.0

  fun fromDirection(direction: Int) = also {
    val (x, y) = when (direction) {
      Companion.DIRECTION_LEFT -> Pair(-1.0, 0.0)
      Companion.DIRECTION_RIGHT -> Pair(1.0, 0.0)
      Companion.DIRECTION_UP -> Pair(0.0, -1.0)
      Companion.DIRECTION_DOWN -> Pair(0.0, 1.0)
      else -> Pair(0.0, 0.0)
    }

    this.x = x
    this.uX = x
    this.y = y
    this.uY = y
  }

  fun fromVelocity(tracker: VelocityTracker) = also {
    tracker.computeCurrentVelocity(1000)

    this.x = tracker.xVelocity.toDouble()
    this.y = tracker.yVelocity.toDouble()

    val magnitude = hypot(this.x, this.y)
    if (magnitude < 0.001) {
      this.uX = 0.0
      this.uY = 0.0
    }

    this.uX = this.x / magnitude
    this.uY = this.y / magnitude
  }

  fun computeSimilarity(vector: Vector): Double {
    return this.uX * vector.uX + this.uY * vector.uY
  }

  fun computeMagnitude(): Double {
    return hypot(this.x, this.y)
  }
}

class FlingGestureHandler : GestureHandler<FlingGestureHandler>() {
  var numberOfPointersRequired = DEFAULT_NUMBER_OF_TOUCHES_REQUIRED
  var direction = DEFAULT_DIRECTION

  private val maxDurationMs = DEFAULT_MAX_DURATION_MS
  private val minVelocity = DEFAULT_MIN_VELOCITY
  private val minDirectionalAlignment = DEFAULT_MIN_DIRECTION_ALIGNMENT
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

    fun compareAlignment(
      vector: Vector,
      direction: Int,
      directionVec: Vector = Vector().fromDirection(direction),
    ): Boolean =
      vector.computeSimilarity(directionVec) > minDirectionalAlignment &&
        (this.direction and direction != 0)

    val velocityTracker = VelocityTracker.obtain()
    addVelocityMovement(velocityTracker, event)
    velocityTracker!!.computeCurrentVelocity(1000)

    val velocityVector = Vector().fromVelocity(velocityTracker)

    val alignmentList = arrayOf(
      compareAlignment(velocityVector, DIRECTION_LEFT),
      compareAlignment(velocityVector, DIRECTION_RIGHT),
      compareAlignment(velocityVector, DIRECTION_UP),
      compareAlignment(velocityVector, DIRECTION_DOWN)
    )

    velocityTracker.recycle()

    val totalVelocity = velocityVector.computeMagnitude()

    val isAligned = alignmentList.any { it }
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
    private const val DEFAULT_MIN_VELOCITY: Long = 2000
    private const val DEFAULT_MIN_DIRECTION_ALIGNMENT: Double = 0.75
    private const val DEFAULT_DIRECTION = DIRECTION_RIGHT
    private const val DEFAULT_NUMBER_OF_TOUCHES_REQUIRED = 1
  }
}
