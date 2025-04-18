package com.swmansion.gesturehandler.core

import android.view.MotionEvent

interface OnTouchEventListener {
  fun <T : GestureHandler> onHandlerUpdate(handler: T, event: MotionEvent)
  fun <T : GestureHandler> onStateChange(handler: T, newState: Int, oldState: Int)
  fun <T : GestureHandler> onTouchEvent(handler: T)
}
