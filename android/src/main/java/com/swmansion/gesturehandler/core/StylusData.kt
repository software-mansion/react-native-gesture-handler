package com.swmansion.gesturehandler.core

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.ReadableMap

data class StylusData(
  var tiltX: Double,
  var tiltY: Double,
  var altitudeAngle: Double,
  var azimuthAngle: Double,
  var pressure: Double
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
