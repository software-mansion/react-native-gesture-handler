package com.swmansion.gesturehandler.react.events

import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.uimanager.events.Event
import com.swmansion.gesturehandler.react.RNGestureHandlerButtonViewManager

class RNGestureHandlerButtonVisualPressEvent(
  button: RNGestureHandlerButtonViewManager.ButtonViewGroup,
  private val pressed: Boolean,
) : Event<RNGestureHandlerButtonVisualPressEvent>(UIManagerHelper.getSurfaceId(button), button.id) {
  override fun getEventName() = "onButtonVisualPressChange"

  override fun canCoalesce() = false

  override fun getEventData(): WritableMap = Arguments.createMap().apply {
    putBoolean("pressed", pressed)
  }
}
