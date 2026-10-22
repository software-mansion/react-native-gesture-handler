package com.swmansion.gesturehandler.react

import android.app.Activity
import android.content.Context
import android.content.ContextWrapper
import android.graphics.PointF
import android.view.Display
import android.view.MotionEvent
import android.view.View
import android.view.ViewGroup
import android.view.accessibility.AccessibilityManager
import com.facebook.react.bridge.ReactContext
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.swmansion.gesturehandler.core.GestureHandler
import com.swmansion.gesturehandler.core.GestureHandlerOrchestrator

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

// Defaults to the first pointer, which is the one every single-pointer stream
// (hover included) describes.
fun MotionEvent.getPointerType(pointerIndex: Int = 0): Int = when (getToolType(pointerIndex)) {
  MotionEvent.TOOL_TYPE_FINGER -> GestureHandler.POINTER_TYPE_TOUCH
  MotionEvent.TOOL_TYPE_STYLUS, MotionEvent.TOOL_TYPE_ERASER -> GestureHandler.POINTER_TYPE_STYLUS
  MotionEvent.TOOL_TYPE_MOUSE -> GestureHandler.POINTER_TYPE_MOUSE
  else -> GestureHandler.POINTER_TYPE_OTHER
}

// Deepest visible descendant under a point given in this group's coordinates, chosen the way
// `ViewGroup.dispatchTouchEvent` picks a child target: last child first, point inside after the
// child's transform. A disabled view consumes the touch only when it is clickable
// (`View.onTouchEvent`), so a disabled non-clickable one is passed over like dispatch does.
// Clipping and pointer-events are not consulted.
fun ViewGroup.findDeepestVisibleChildAt(x: Float, y: Float): View? {
  val point = PointF()
  for (i in childCount - 1 downTo 0) {
    val child = getChildAt(i)
    if (child.visibility != View.VISIBLE) {
      continue
    }
    GestureHandlerOrchestrator.transformPointToChildViewCoords(x, y, this, child, point)
    if (point.x !in 0f..child.width.toFloat() || point.y !in 0f..child.height.toFloat()) {
      continue
    }
    val hit = (child as? ViewGroup)?.findDeepestVisibleChildAt(point.x, point.y) ?: child
    if (hit === child && !child.isEnabled && !child.consumesTouchWhenDisabled()) {
      continue
    }
    return hit
  }
  return null
}

private fun View.consumesTouchWhenDisabled() = isClickable || isLongClickable || isContextClickable

// Whether the native target of this DOWN (coordinates in this group's space) is a disabled view.
// A disabled view consumes touches but never responds to them, so it cannot own the stream.
fun ViewGroup.hasDisabledTouchTargetAt(down: MotionEvent): Boolean {
  val index = down.actionIndex
  return findDeepestVisibleChildAt(down.getX(index), down.getY(index))?.isEnabled == false
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
