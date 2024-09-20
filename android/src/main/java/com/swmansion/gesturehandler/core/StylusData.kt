package com.swmansion.gesturehandler.core

import android.view.MotionEvent
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReadableMap
import com.swmansion.gesturehandler.core.GestureUtils.spherical2tilt
import kotlin.math.PI

data class StylusData(
  val tiltX: Double = 0.0,
  val tiltY: Double = 0.0,
  val altitudeAngle: Double = 0.0,
  val azimuthAngle: Double = 0.0,
  val pressure: Double = -1.0
) {
  fun toReadableMap(): ReadableMap {
    val stylusDataObject = Arguments.createMap()

    stylusDataObject.putDouble("tiltX", tiltX)
    stylusDataObject.putDouble("tiltY", tiltY)
    stylusDataObject.putDouble("altitudeAngle", altitudeAngle)
    stylusDataObject.putDouble("azimuthAngle", azimuthAngle)
    stylusDataObject.putDouble("pressure", pressure)

    val readableStylusData: ReadableMap = stylusDataObject

    return readableStylusData
  }

  companion object {
    fun fromEvent(event: MotionEvent): StylusData {
      // On web and iOS 0 degrees means that stylus is parallel to the surface. On android this value will be PI / 2.
      val altitudeAngle = (PI / 2) - event.getAxisValue(MotionEvent.AXIS_TILT).toDouble()
      val pressure = event.getPressure(0).toDouble()
      val orientation = event.getOrientation(0).toDouble()
      // To get azimuth angle, we need to use orientation property (https://developer.android.com/develop/ui/compose/touch-input/stylus-input/advanced-stylus-features#orientation).
      val azimuthAngle = (orientation + PI / 2).mod(2 * PI)
      val tilts = GestureUtils.spherical2tilt(altitudeAngle, azimuthAngle)

      return StylusData(tilts.first, tilts.second, altitudeAngle, azimuthAngle, pressure)
    }
  }
}
