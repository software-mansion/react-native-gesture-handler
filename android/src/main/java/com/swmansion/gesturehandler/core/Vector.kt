package com.swmansion.gesturehandler.core

import android.view.VelocityTracker
import com.swmansion.gesturehandler.core.GestureHandler.Companion.DIRECTION_DOWN
import com.swmansion.gesturehandler.core.GestureHandler.Companion.DIRECTION_LEFT
import com.swmansion.gesturehandler.core.GestureHandler.Companion.DIRECTION_RIGHT
import com.swmansion.gesturehandler.core.GestureHandler.Companion.DIRECTION_UP
import kotlin.math.hypot

class Vector {
    var x: Double = 0.0
    var y: Double = 0.0
    private var unitX: Double = 0.0
    private var unitY: Double = 0.0

    fun fromDirection(direction: Int) = also {
        val (newX, newY) = when (direction) {
            DIRECTION_LEFT -> Pair(-1.0, 0.0)
            DIRECTION_RIGHT -> Pair(1.0, 0.0)
            DIRECTION_UP -> Pair(0.0, -1.0)
            DIRECTION_DOWN -> Pair(0.0, 1.0)
            else -> Pair(0.0, 0.0)
        }

        x = newX
        y = newY
        unitX = newX
        unitY = newY
    }

    fun fromVelocity(tracker: VelocityTracker) = also {
        tracker.computeCurrentVelocity(1000)

        x = tracker.xVelocity.toDouble()
        y = tracker.yVelocity.toDouble()

        val minimalMagnitude = 1
        val isMagnitudeSufficient = magnitude > minimalMagnitude

        unitX = if (isMagnitudeSufficient) x / magnitude else 0.0
        unitY = if (isMagnitudeSufficient) y / magnitude else 0.0

    }

    fun computeSimilarity(vector: Vector): Double {
        return unitX * vector.unitX + unitY * vector.unitY
    }

    fun isSimilar(vector: Vector, threshold: Double): Boolean {
        return computeSimilarity(vector) > threshold
    }

    val magnitude
        get() = hypot(x, y)

    companion object {
        val VECTOR_LEFT: Vector = Vector().fromDirection(DIRECTION_LEFT)
        val VECTOR_RIGHT: Vector = Vector().fromDirection(DIRECTION_RIGHT)
        val VECTOR_UP: Vector = Vector().fromDirection(DIRECTION_UP)
        val VECTOR_DOWN: Vector = Vector().fromDirection(DIRECTION_DOWN)
        val VECTOR_ZERO: Vector = Vector()

        fun fromDirection(direction: Int): Vector =
            when (direction) {
                DIRECTION_LEFT -> VECTOR_LEFT
                DIRECTION_RIGHT -> VECTOR_RIGHT
                DIRECTION_UP -> VECTOR_UP
                DIRECTION_DOWN -> VECTOR_DOWN
                else -> VECTOR_ZERO
            }

    }
}
