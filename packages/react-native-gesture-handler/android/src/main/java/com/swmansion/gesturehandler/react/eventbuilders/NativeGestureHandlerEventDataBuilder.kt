package com.swmansion.gesturehandler.react.eventbuilders

import com.facebook.react.bridge.WritableMap
import com.swmansion.gesturehandler.core.NativeViewGestureHandler

class NativeGestureHandlerEventDataBuilder(handler: NativeViewGestureHandler) :
  GestureHandlerEventDataBuilder<NativeViewGestureHandler>(handler) {
  private val pointerInside: Boolean = handler.isWithinBounds

  override fun buildEventData(eventData: WritableMap) {
    super.buildEventData(eventData)

    eventData.putBoolean("pointerInside", pointerInside)
  }
}
