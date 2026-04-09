package com.swmansion.gesturehandler.react

import android.content.Context
import android.view.MotionEvent
import android.view.accessibility.AccessibilityManager
import com.facebook.react.bridge.ReactContext
import com.facebook.react.modules.core.DeviceEventManagerModule

val ReactContext.deviceEventEmitter: DeviceEventManagerModule.RCTDeviceEventEmitter
  get() = this.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)

fun Context.isScreenReaderOn() =
  (getSystemService(Context.ACCESSIBILITY_SERVICE) as AccessibilityManager).isTouchExplorationEnabled

fun MotionEvent.isHoverAction(): Boolean = action == MotionEvent.ACTION_HOVER_MOVE ||
  action == MotionEvent.ACTION_HOVER_ENTER ||
  action == MotionEvent.ACTION_HOVER_EXIT
