package com.swmansion.gesturehandler.react.eventbuilders

import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.PixelUtil
import com.swmansion.gesturehandler.core.RotationGestureHandler

class RotationGestureHandlerEventDataBuilder(handler: RotationGestureHandler) :
  GestureHandlerEventDataBuilder<RotationGestureHandler>(handler) {
  private val rotation: Double = handler.rotation
  private val anchorX: Float = handler.anchorX
  private val anchorY: Float = handler.anchorY
  private val velocity: Double = handler.velocity

  override fun buildEventData(eventData: WritableMap) {
    super.buildEventData(eventData)

    with(eventData) {
      putDouble("rotation", rotation)
      putDouble("anchorX", PixelUtil.toDIPFromPixel(anchorX).toDouble())
      putDouble("anchorY", PixelUtil.toDIPFromPixel(anchorY).toDouble())
      putDouble("velocity", velocity)
    }
  }
}
