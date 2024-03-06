package com.swmansion.gesturehandler

import com.facebook.react.bridge.ReactContext
import com.facebook.react.uimanager.events.Event

class ReanimatedEventDispatcher {
  @Suppress("UNUSED_PARAMETER", "COMMENT_IN_SUPPRESSION")
  // These parameters may be useful in the future
  fun <T : Event<T>>sendEvent(event: T, reactApplicationContext: ReactContext) {
    // no-op
  }
}
