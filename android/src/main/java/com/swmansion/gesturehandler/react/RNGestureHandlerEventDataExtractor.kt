package com.swmansion.gesturehandlerv2.react

import com.facebook.react.bridge.WritableMap
import com.swmansion.gesturehandlerv2.GestureHandler

interface RNGestureHandlerEventDataExtractor<T : GestureHandler<T>> {
  fun extractEventData(handler: T, eventData: WritableMap)
}
