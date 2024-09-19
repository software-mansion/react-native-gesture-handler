package com.swmansion.gesturehandler.core

import android.view.MotionEvent
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import kotlin.math.PI
import kotlin.math.abs
import kotlin.math.atan
import kotlin.math.cos
import kotlin.math.round
import kotlin.math.sin
import kotlin.math.tan

object GestureUtils {
  fun getLastPointerX(event: MotionEvent, averageTouches: Boolean): Float {
    val excludeIndex = if (event.actionMasked == MotionEvent.ACTION_POINTER_UP) event.actionIndex else -1
    return if (averageTouches) {
      var sum = 0f
      var count = 0
      for (i in 0 until event.pointerCount) {
        if (i != excludeIndex) {
          sum += event.getX(i)
          count++
        }
      }
      sum / count
    } else {
      var lastPointerIdx = event.pointerCount - 1
      if (lastPointerIdx == excludeIndex) {
        lastPointerIdx--
      }
      event.getX(lastPointerIdx)
    }
  }

  fun getLastPointerY(event: MotionEvent, averageTouches: Boolean): Float {
    val excludeIndex = if (event.actionMasked == MotionEvent.ACTION_POINTER_UP) event.actionIndex else -1
    return if (averageTouches) {
      var sum = 0f
      var count = 0
      for (i in 0 until event.pointerCount) {
        if (i != excludeIndex) {
          sum += event.getY(i)
          count++
        }
      }
      sum / count
    } else {
      var lastPointerIdx = event.pointerCount - 1
      if (lastPointerIdx == excludeIndex) {
        lastPointerIdx -= 1
      }
      event.getY(lastPointerIdx)
    }
  }
  fun coneToDeviation(angle: Double): Double =
    cos(Math.toRadians(angle / 2.0))

  fun getStylusData(event: MotionEvent): StylusData {
    // On web and iOS 0 degrees means that stylus is parallel to the surface. On android this value will be PI / 2.
    val altitudeAngle = (PI / 2) - event.getAxisValue(MotionEvent.AXIS_TILT).toDouble()
    val pressure = event.getPressure(0).toDouble()

    var orientation = event.getOrientation(0).toDouble()

    // To get azimuth angle, we need to use orientation property. Orientation value range is [-PI, PI] (https://developer.android.com/develop/ui/compose/touch-input/stylus-input/advanced-stylus-features#orientation)
    // To shift range into [0, 2PI], we add 2PI if orientation is less than 0.
    if (orientation < 0) {
      orientation += 2 * PI
    }

    // To get the same value that we get on web, we have to perform shift by PI/2.
    // However, if orientation is greater than 3PI/2 we would get angles greater than 2PI. Therefore we simply subtract 3PI/2 in that case.
    val azimuthAngle = if (orientation >= 3 * PI / 2) {
      orientation - 3 * PI / 2
    } else {
      orientation + PI / 2
    }

    val tilts = spherical2tilt(altitudeAngle, azimuthAngle)

    return StylusData(tilts.first, tilts.second, altitudeAngle, azimuthAngle, pressure)
  }

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

  fun createStylusDataObject(stylusData: StylusData): WritableMap {
    val stylusDataObject = Arguments.createMap()

    stylusDataObject.putDouble("tiltX", stylusData.tiltX)
    stylusDataObject.putDouble("tiltY", stylusData.tiltY)
    stylusDataObject.putDouble("altitudeAngle", stylusData.altitudeAngle)
    stylusDataObject.putDouble("azimuthAngle", stylusData.azimuthAngle)
    stylusDataObject.putDouble("pressure", stylusData.pressure)

    return stylusDataObject
  }
}
