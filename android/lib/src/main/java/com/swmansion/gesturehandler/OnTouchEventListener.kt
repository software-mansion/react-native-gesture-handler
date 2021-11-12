package com.swmansion.gesturehandler

import android.view.MotionEvent

interface OnTouchEventListener {
  fun <T : GestureHandler<T>> onTouchEvent(handler: T, event: MotionEvent)
  fun <T : GestureHandler<T>> onStateChange(handler: T, newState: Int, oldState: Int)
  fun <T : GestureHandler<T>> onPointerEvent(handler: T)
}
