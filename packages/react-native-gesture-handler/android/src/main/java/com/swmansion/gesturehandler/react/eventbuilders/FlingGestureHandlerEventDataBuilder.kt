package com.swmansion.gesturehandler.react.eventbuilders

import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.PixelUtil
import com.swmansion.gesturehandler.core.FlingGestureHandler

class FlingGestureHandlerEventDataBuilder(handler: FlingGestureHandler) :
  GestureHandlerEventDataBuilder<FlingGestureHandler>(handler) {
  private val x: Float = handler.lastRelativePositionX
  private val y: Float = handler.lastRelativePositionY
  private val absoluteX: Float = handler.lastPositionInWindowX
  private val absoluteY: Float = handler.lastPositionInWindowY

  override fun buildEventData(eventData: WritableMap) {
    super.buildEventData(eventData)

    with(eventData) {
      putDouble("x", PixelUtil.toDIPFromPixel(x).toDouble())
      putDouble("y", PixelUtil.toDIPFromPixel(y).toDouble())
      putDouble("absoluteX", PixelUtil.toDIPFromPixel(absoluteX).toDouble())
      putDouble("absoluteY", PixelUtil.toDIPFromPixel(absoluteY).toDouble())
    }
  }
}
