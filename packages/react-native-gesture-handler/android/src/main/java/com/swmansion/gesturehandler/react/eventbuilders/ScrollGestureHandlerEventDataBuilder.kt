package com.swmansion.gesturehandler.react.eventbuilders

import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.PixelUtil
import com.swmansion.gesturehandler.core.ScrollGestureHandler

class ScrollGestureHandlerEventDataBuilder(handler: ScrollGestureHandler) :
  GestureHandlerEventDataBuilder<ScrollGestureHandler>(handler) {
  private val x: Float
  private val y: Float
  private val absoluteX: Float
  private val absoluteY: Float
  private val scrollX: Float
  private val scrollY: Float
  private val deltaX: Float
  private val deltaY: Float

  init {
    // Use scroll-specific position values since scroll events bypass normal handle method
    x = handler.lastScrollPositionX
    y = handler.lastScrollPositionY
    absoluteX = handler.lastScrollAbsoluteX
    absoluteY = handler.lastScrollAbsoluteY
    scrollX = handler.scrollX
    scrollY = handler.scrollY
    deltaX = handler.deltaX
    deltaY = handler.deltaY
  }

  override fun buildEventData(eventData: WritableMap) {
    super.buildEventData(eventData)

    with(eventData) {
      putDouble("x", PixelUtil.toDIPFromPixel(x).toDouble())
      putDouble("y", PixelUtil.toDIPFromPixel(y).toDouble())
      putDouble("absoluteX", PixelUtil.toDIPFromPixel(absoluteX).toDouble())
      putDouble("absoluteY", PixelUtil.toDIPFromPixel(absoluteY).toDouble())
      putDouble("scrollX", scrollX.toDouble())
      putDouble("scrollY", scrollY.toDouble())
      putDouble("deltaX", deltaX.toDouble())
      putDouble("deltaY", deltaY.toDouble())
    }
  }
}
