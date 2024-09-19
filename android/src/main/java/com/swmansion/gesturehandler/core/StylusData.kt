package com.swmansion.gesturehandler.core

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReadableMap

data class StylusData(
  var tiltX: Double = 0.0,
  var tiltY: Double = 0.0,
  var altitudeAngle: Double = 0.0,
  var azimuthAngle: Double = 0.0,
  var pressure: Double = -1.0
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
}
