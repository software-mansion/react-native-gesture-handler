package com.swmansion.gesturehandler.react

import android.content.Context
import android.view.accessibility.AccessibilityManager
import com.facebook.react.bridge.ReactContext
import com.facebook.react.modules.core.DeviceEventManagerModule

val ReactContext.deviceEventEmitter: DeviceEventManagerModule.RCTDeviceEventEmitter
  get() = this.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)

fun Context.isScreenReaderOn() =
  (getSystemService(Context.ACCESSIBILITY_SERVICE) as AccessibilityManager).isTouchExplorationEnabled
