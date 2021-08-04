package com.swmansion.gesturehandler

import android.view.MotionEvent

interface OnTouchEventListener<T : GestureHandler<T>> {
  fun onTouchEvent(handler: T, event: MotionEvent?)
  fun onStateChange(handler: T, newState: Int, oldState: Int)
}
