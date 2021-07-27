package com.swmansion.gesturehandler.react

import com.facebook.react.bridge.WritableMap
import com.swmansion.gesturehandler.GestureHandler

interface RNGestureHandlerEventDataExtractor<T : GestureHandler<*>> {
  fun extractEventData(handler: T, eventData: WritableMap)
}