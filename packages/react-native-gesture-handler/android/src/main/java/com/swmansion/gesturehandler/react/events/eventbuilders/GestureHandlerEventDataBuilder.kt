package com.swmansion.gesturehandler.react.events.eventbuilders

import com.facebook.react.bridge.WritableMap
import com.swmansion.gesturehandler.core.GestureHandler

abstract class GestureHandlerEventDataBuilder<T : GestureHandler>(handler: T) {
  public val handlerTag: Int = handler.tag
  public val state: Int = handler.state
  private val pointerType: Int = handler.pointerType
  private val numberOfPointers: Int = handler.numberOfPointers

  open fun buildEventData(eventData: WritableMap) {
    eventData.putInt("numberOfPointers", numberOfPointers)
    eventData.putInt("pointerType", pointerType)
  }
}
