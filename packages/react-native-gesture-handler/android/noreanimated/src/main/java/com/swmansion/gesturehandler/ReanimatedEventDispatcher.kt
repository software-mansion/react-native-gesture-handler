package com.swmansion.gesturehandler

import com.facebook.react.bridge.ReactContext
import com.facebook.react.uimanager.events.Event

class ReanimatedEventDispatcher {
  // This is necessary on new architecture
  @Suppress("UNUSED_PARAMETER", "COMMENT_IN_SUPPRESSION")
  fun <T : Event<T>> sendEvent(event: T, reactApplicationContext: ReactContext) {
    // no-op
  }
}
