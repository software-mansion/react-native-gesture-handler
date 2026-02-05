package com.swmansion.gesturehandler.react.events.eventbuilders

import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.PixelUtil
import com.swmansion.gesturehandler.core.PinchGestureHandler

class PinchGestureHandlerEventDataBuilder(handler: PinchGestureHandler) :
  GestureHandlerEventDataBuilder<PinchGestureHandler>(handler) {
  private val scale: Double = handler.scale
  private val focalX: Float = handler.focalPointX
  private val focalY: Float = handler.focalPointY
  private val velocity: Double = handler.velocity

  override fun buildEventData(eventData: WritableMap) {
    super.buildEventData(eventData)

    with(eventData) {
      putDouble("scale", scale)
      putDouble("focalX", PixelUtil.toDIPFromPixel(focalX).toDouble())
      putDouble("focalY", PixelUtil.toDIPFromPixel(focalY).toDouble())
      putDouble("velocity", velocity)
    }
  }
}
