package com.swmansion.gesturehandler.react.eventbuilders

import com.facebook.react.bridge.WritableMap
import com.swmansion.gesturehandler.core.GestureHandler

abstract class GestureHandlerEventDataBuilder<T : GestureHandler>(handler: T) {
  private val handlerTag: Int = handler.tag
  private val state: Int = handler.state
  private val pointerType: Int = handler.pointerType
  private val numberOfPointers: Int = handler.numberOfPointers

  open fun buildEventData(eventData: WritableMap) {
    eventData.putInt("numberOfPointers", numberOfPointers)
    eventData.putInt("handlerTag", handlerTag)
    eventData.putInt("state", state)
    eventData.putInt("pointerType", pointerType)
  }
}
