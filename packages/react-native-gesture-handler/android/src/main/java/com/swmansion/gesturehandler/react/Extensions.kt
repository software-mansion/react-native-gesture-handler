package com.swmansion.gesturehandler.react

import android.app.Activity
import android.content.Context
import android.content.ContextWrapper
import android.os.Build
import android.view.Display
import android.view.MotionEvent
import android.view.accessibility.AccessibilityManager
import com.facebook.react.bridge.ReactContext
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.swmansion.gesturehandler.core.GestureHandler

val ReactContext.deviceEventEmitter: DeviceEventManagerModule.RCTDeviceEventEmitter
  get() = this.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)

// Views are handed a ThemedReactContext, so the activity may sit behind a chain
// of context wrappers.
fun Context?.findActivity(): Activity? = when (this) {
  is ReactContext -> currentActivity
  is Activity -> this
  is ContextWrapper -> baseContext.findActivity()
  else -> null
}

fun Context.isScreenReaderOn() =
  (getSystemService(Context.ACCESSIBILITY_SERVICE) as AccessibilityManager).isTouchExplorationEnabled

fun MotionEvent.isHoverAction(): Boolean = action == MotionEvent.ACTION_HOVER_MOVE ||
  action == MotionEvent.ACTION_HOVER_ENTER ||
  action == MotionEvent.ACTION_HOVER_EXIT

fun MotionEvent.isButtonAction(): Boolean = actionMasked == MotionEvent.ACTION_BUTTON_PRESS ||
  actionMasked == MotionEvent.ACTION_BUTTON_RELEASE

// MotionEvent.CLASSIFICATION_TWO_FINGER_SWIPE, which needs compileSdk 34.
private const val CLASSIFICATION_TWO_FINGER_SWIPE = 3

// Android 14+ turns a two-finger touchpad swipe into a single fake-finger touch stream
// carrying this classification; mouse wheels arrive as ACTION_SCROLL instead.
fun MotionEvent.isTrackpadScroll(): Boolean =
  Build.VERSION.SDK_INT >= 34 && classification == CLASSIFICATION_TWO_FINGER_SWIPE

// Defaults to the first pointer, which is the one every single-pointer stream
// (hover included) describes.
fun MotionEvent.getPointerType(pointerIndex: Int = 0): Int = when (getToolType(pointerIndex)) {
  MotionEvent.TOOL_TYPE_FINGER -> GestureHandler.POINTER_TYPE_TOUCH
  MotionEvent.TOOL_TYPE_STYLUS, MotionEvent.TOOL_TYPE_ERASER -> GestureHandler.POINTER_TYPE_STYLUS
  MotionEvent.TOOL_TYPE_MOUSE -> GestureHandler.POINTER_TYPE_MOUSE
  else -> GestureHandler.POINTER_TYPE_OTHER
}

val Display.minimumFrameTime: Float
  get() {
    val supportedModes = this.supportedModes
    var maxRefreshRate = 0f

    supportedModes.forEach { mode ->
      if (mode.refreshRate > maxRefreshRate) {
        maxRefreshRate = mode.refreshRate
      }
    }

    val effectiveRefreshRate = when {
      maxRefreshRate > 0f -> maxRefreshRate
      refreshRate > 0f -> refreshRate
      else -> 60f
    }

    return 1000.0f / effectiveRefreshRate
  }
