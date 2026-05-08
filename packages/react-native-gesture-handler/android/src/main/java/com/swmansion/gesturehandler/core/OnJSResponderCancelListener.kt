package com.swmansion.gesturehandler.core

interface OnJSResponderCancelListener {
  fun onCancelJSResponderRequested(handler: GestureHandler)
  fun onCancelJSResponderReleased(handler: GestureHandler)
}
