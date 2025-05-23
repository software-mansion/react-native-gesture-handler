package com.swmansion.gesturehandler.react.eventbuilders

import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.PixelUtil
import com.swmansion.gesturehandler.core.HoverGestureHandler
import com.swmansion.gesturehandler.core.StylusData

class HoverGestureHandlerEventDataBuilder(handler: HoverGestureHandler) :
  GestureHandlerEventDataBuilder<HoverGestureHandler>(handler) {
  private val x: Float
  private val y: Float
  private val absoluteX: Float
  private val absoluteY: Float
  private val stylusData: StylusData

  init {
    x = handler.lastRelativePositionX
    y = handler.lastRelativePositionY
    absoluteX = handler.lastPositionInWindowX
    absoluteY = handler.lastPositionInWindowY
    stylusData = handler.stylusData
  }

  override fun buildEventData(eventData: WritableMap) {
    super.buildEventData(eventData)

    with(eventData) {
      putDouble("x", PixelUtil.toDIPFromPixel(x).toDouble())
      putDouble("y", PixelUtil.toDIPFromPixel(y).toDouble())
      putDouble("absoluteX", PixelUtil.toDIPFromPixel(absoluteX).toDouble())
      putDouble("absoluteY", PixelUtil.toDIPFromPixel(absoluteY).toDouble())

      if (stylusData.pressure != -1.0) {
        putMap("stylusData", stylusData.toReadableMap())
      }
    }
  }
}
