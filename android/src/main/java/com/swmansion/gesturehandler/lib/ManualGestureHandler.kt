package com.swmansion.gesturehandler.lib

import android.view.MotionEvent

class ManualGestureHandler : GestureHandler<ManualGestureHandler>() {
  override fun onHandle(event: MotionEvent, sourceEvent: MotionEvent) {
    if (state == STATE_UNDETERMINED) {
      begin()
    }
  }
}
