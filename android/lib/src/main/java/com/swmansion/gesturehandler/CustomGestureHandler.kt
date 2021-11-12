package com.swmansion.gesturehandler

import android.view.MotionEvent

class CustomGestureHandler : GestureHandler<CustomGestureHandler>() {
  override fun onHandle(event: MotionEvent) {
    if (state == STATE_UNDETERMINED) {
      begin()
    }
  }
}
