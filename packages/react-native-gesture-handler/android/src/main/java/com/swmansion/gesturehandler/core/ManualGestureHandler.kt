package com.swmansion.gesturehandler.core

import android.content.Context
import android.view.MotionEvent
import com.swmansion.gesturehandler.react.eventbuilders.ManualGestureHandlerEventDataBuilder

class ManualGestureHandler : GestureHandler() {
  override fun onHandle(event: MotionEvent, sourceEvent: MotionEvent) {
    if (state == STATE_UNDETERMINED) {
      begin()
    }
  }

  class Factory : GestureHandler.Factory<ManualGestureHandler>() {
    override val type = ManualGestureHandler::class.java
    override val name = "ManualGestureHandler"

    override fun create(context: Context?): ManualGestureHandler = ManualGestureHandler()

    override fun createEventBuilder(handler: ManualGestureHandler) = ManualGestureHandlerEventDataBuilder(handler)
  }
}
