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
        val (x, y) = when (direction) {
            DIRECTION_LEFT -> Pair(-1.0, 0.0)
            DIRECTION_RIGHT -> Pair(1.0, 0.0)
            DIRECTION_UP -> Pair(0.0, -1.0)
            DIRECTION_DOWN -> Pair(0.0, 1.0)
            else -> Pair(0.0, 0.0)
        }

        this.x = x
        this.y = y
        this.unitX = x
        this.unitY = y
    }

    fun fromVelocity(tracker: VelocityTracker) = also {
        tracker.computeCurrentVelocity(1000)

        this.x = tracker.xVelocity.toDouble()
        this.y = tracker.yVelocity.toDouble()

        val magnitude = this.magnitude
        if (magnitude < 1) {
            this.unitX = 0.0
            this.unitY = 0.0
        } else {
            this.unitX = this.x / magnitude
            this.unitY = this.y / magnitude
        }

    }

    fun computeSimilarity(vector: Vector): Double {
        return this.unitX * vector.unitX + this.unitY * vector.unitY
    }

    fun isSimilar(vector: Vector, threshold: Double): Boolean {
        return this.computeSimilarity(vector) > threshold
    }

    val magnitude
        get() = hypot(this.x, this.y)

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
