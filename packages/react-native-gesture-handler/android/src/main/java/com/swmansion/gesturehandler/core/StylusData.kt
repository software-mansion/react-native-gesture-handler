package com.swmansion.gesturehandler.core

import android.view.MotionEvent
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReadableMap
import kotlin.math.PI
import kotlin.math.abs
import kotlin.math.atan
import kotlin.math.cos
import kotlin.math.round
import kotlin.math.sin
import kotlin.math.tan

data class StylusData(
  val tiltX: Double = 0.0,
  val tiltY: Double = 0.0,
  val altitudeAngle: Double = 0.0,
  val azimuthAngle: Double = 0.0,
  val pressure: Double = -1.0,
) {
  fun toReadableMap(): ReadableMap {
    val stylusDataObject = Arguments.createMap().apply {
      putDouble("tiltX", tiltX)
      putDouble("tiltY", tiltY)
      putDouble("altitudeAngle", altitudeAngle)
      putDouble("azimuthAngle", azimuthAngle)
      putDouble("pressure", pressure)
    }

    val readableStylusData: ReadableMap = stylusDataObject

    return readableStylusData
  }

  companion object {
    // Source: https://w3c.github.io/pointerevents/#converting-between-tiltx-tilty-and-altitudeangle-azimuthangle
    private fun spherical2tilt(altitudeAngle: Double, azimuthAngle: Double): Pair<Double, Double> {
      val eps = 0.000000001
      val radToDeg = 180 / PI

      var tiltXrad = 0.0
      var tiltYrad = 0.0

      if (altitudeAngle < eps) {
        // the pen is in the X-Y plane
        if (azimuthAngle < eps || abs(azimuthAngle - 2 * PI) < eps) {
          // pen is on positive X axis
          tiltXrad = PI / 2
        }
        if (abs(azimuthAngle - PI / 2) < eps) {
          // pen is on positive Y axis
          tiltYrad = PI / 2
        }
        if (abs(azimuthAngle - PI) < eps) {
          // pen is on negative X axis
          tiltXrad = -PI / 2
        }
        if (abs(azimuthAngle - (3 * PI) / 2) < eps) {
          // pen is on negative Y axis
          tiltYrad = -PI / 2
        }
        if (azimuthAngle > eps && abs(azimuthAngle - PI / 2) < eps) {
          tiltXrad = PI / 2
          tiltYrad = PI / 2
        }
        if (abs(azimuthAngle - PI / 2) > eps && abs(azimuthAngle - PI) < eps) {
          tiltXrad = -PI / 2
          tiltYrad = PI / 2
        }
        if (abs(azimuthAngle - PI) > eps && abs(azimuthAngle - (3 * PI) / 2) < eps) {
          tiltXrad = -PI / 2
          tiltYrad = -PI / 2
        }
        if (abs(azimuthAngle - (3 * PI) / 2) > eps && abs(azimuthAngle - 2 * PI) < eps) {
          tiltXrad = PI / 2
          tiltYrad = -PI / 2
        }
      } else {
        val tanAlt = tan(altitudeAngle)

        tiltXrad = atan(cos(azimuthAngle) / tanAlt)
        tiltYrad = atan(sin(azimuthAngle) / tanAlt)
      }

      val tiltX = round(tiltXrad * radToDeg)
      val tiltY = round(tiltYrad * radToDeg)

      return Pair(tiltX, tiltY)
    }

    fun fromEvent(event: MotionEvent): StylusData {
      // On web and iOS 0 degrees means that stylus is parallel to the surface. On android this value will be PI / 2.
      val altitudeAngle = (PI / 2) - event.getAxisValue(MotionEvent.AXIS_TILT).toDouble()
      val pressure = event.getPressure(0).toDouble()
      val orientation = event.getOrientation(0).toDouble()
      // To get azimuth angle, we need to use orientation property (https://developer.android.com/develop/ui/compose/touch-input/stylus-input/advanced-stylus-features#orientation).
      val azimuthAngle = (orientation + PI / 2).mod(2 * PI)
      val tilts = spherical2tilt(altitudeAngle, azimuthAngle)

      return StylusData(tilts.first, tilts.second, altitudeAngle, azimuthAngle, pressure)
    }
  }
}
