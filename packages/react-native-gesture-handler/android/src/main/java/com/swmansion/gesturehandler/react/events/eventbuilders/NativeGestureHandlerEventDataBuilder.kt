package com.swmansion.gesturehandler.react.events.eventbuilders

import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.PixelUtil
import com.swmansion.gesturehandler.core.NativeViewGestureHandler

class NativeGestureHandlerEventDataBuilder(handler: NativeViewGestureHandler) :
  GestureHandlerEventDataBuilder<NativeViewGestureHandler>(handler) {
  private val pointerInside: Boolean = handler.isWithinBounds
  private val x: Float = handler.lastRelativePositionX
  private val y: Float = handler.lastRelativePositionY
  private val absoluteX: Float = handler.lastPositionInWindowX
  private val absoluteY: Float = handler.lastPositionInWindowY

  override fun buildEventData(eventData: WritableMap) {
    super.buildEventData(eventData)

    eventData.putBoolean("pointerInside", pointerInside)

    with(eventData) {
      putDouble("x", PixelUtil.toDIPFromPixel(x).toDouble())
      putDouble("y", PixelUtil.toDIPFromPixel(y).toDouble())
      putDouble("absoluteX", PixelUtil.toDIPFromPixel(absoluteX).toDouble())
      putDouble("absoluteY", PixelUtil.toDIPFromPixel(absoluteY).toDouble())
    }
  }
}
