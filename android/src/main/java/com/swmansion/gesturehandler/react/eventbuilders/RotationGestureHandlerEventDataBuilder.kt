package com.swmansion.gesturehandler.react.eventbuilders

import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.PixelUtil
import com.swmansion.gesturehandler.core.RotationGestureHandler

class RotationGestureHandlerEventDataBuilder(handler: RotationGestureHandler) : GestureHandlerEventDataBuilder<RotationGestureHandler>(handler) {
  private val rotation: Double
  private val anchorX: Float
  private val anchorY: Float
  private val velocity: Double

  init {
    rotation = handler.rotation
    anchorX = handler.anchorX
    anchorY = handler.anchorY
    velocity = handler.velocity
  }

  override fun buildEventData(eventData: WritableMap) {
    super.buildEventData(eventData)

    with(eventData) {
      putDouble("scale", rotation)
      putDouble("focalX", PixelUtil.toDIPFromPixel(anchorX).toDouble())
      putDouble("focalY", PixelUtil.toDIPFromPixel(anchorY).toDouble())
      putDouble("velocity", velocity)
    }
  }
}
