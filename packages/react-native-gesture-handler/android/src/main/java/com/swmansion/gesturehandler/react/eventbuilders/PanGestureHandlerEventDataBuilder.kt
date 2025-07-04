package com.swmansion.gesturehandler.react.eventbuilders

import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.PixelUtil
import com.swmansion.gesturehandler.core.PanGestureHandler
import com.swmansion.gesturehandler.core.StylusData

class PanGestureHandlerEventDataBuilder(handler: PanGestureHandler) :
  GestureHandlerEventDataBuilder<PanGestureHandler>(handler) {
  private val x: Float = handler.lastRelativePositionX
  private val y: Float = handler.lastRelativePositionY
  private val absoluteX: Float = handler.lastPositionInWindowX
  private val absoluteY: Float = handler.lastPositionInWindowY
  private val translationX: Float = handler.translationX
  private val translationY: Float = handler.translationY
  private val velocityX: Float = handler.velocityX
  private val velocityY: Float = handler.velocityY
  private val stylusData: StylusData = handler.stylusData

  override fun buildEventData(eventData: WritableMap) {
    super.buildEventData(eventData)

    with(eventData) {
      putDouble("x", PixelUtil.toDIPFromPixel(x).toDouble())
      putDouble("y", PixelUtil.toDIPFromPixel(y).toDouble())
      putDouble("absoluteX", PixelUtil.toDIPFromPixel(absoluteX).toDouble())
      putDouble("absoluteY", PixelUtil.toDIPFromPixel(absoluteY).toDouble())
      putDouble("translationX", PixelUtil.toDIPFromPixel(translationX).toDouble())
      putDouble("translationY", PixelUtil.toDIPFromPixel(translationY).toDouble())
      putDouble("velocityX", PixelUtil.toDIPFromPixel(velocityX).toDouble())
      putDouble("velocityY", PixelUtil.toDIPFromPixel(velocityY).toDouble())

      if (stylusData.pressure != -1.0) {
        putMap("stylusData", stylusData.toReadableMap())
      }
    }
  }
}
