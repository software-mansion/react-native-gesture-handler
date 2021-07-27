package com.swmansion.gesturehandler

import android.view.MotionEvent

interface OnTouchEventListener<ConcreteGestureHandlerT : GestureHandler<*>> {
  fun onTouchEvent(handler: ConcreteGestureHandlerT, event: MotionEvent?)
  fun onStateChange(handler: ConcreteGestureHandlerT, newState: Int, oldState: Int)
}