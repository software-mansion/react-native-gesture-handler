package com.swmansion.gesturehandler.react

import android.content.Context
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.views.view.ReactViewGroup
import com.swmansion.gesturehandler.core.GestureHandler

class RNGestureHandlerDetectorView(context: Context) : ReactViewGroup(context) {
  private val reactContext: ThemedReactContext
    get() = context as ThemedReactContext
  private var attachedHandlers = listOf<Int>()

  fun setHandlerTags(handlerTags: ReadableArray?) {
    val newHandlers = handlerTags?.toArrayList()?.map { (it as Double).toInt() } ?: emptyList()

    val KEEP = 0
    val ATTACH = 1
    val DETACH = 2

    val changes = mutableMapOf<Int, Int>()

    for (tag in attachedHandlers) {
      changes[tag] = DETACH
    }

    for (tag in newHandlers) {
      changes[tag] = if (changes.containsKey(tag)) KEEP else ATTACH
    }

    for (entry in changes) {
      if (entry.value == ATTACH) {
        RNGestureHandlerModule.registry.attachHandlerToView(entry.value, this.id, GestureHandler.ACTION_TYPE_NATIVE_DETECTOR)
      } else if (entry.value == DETACH) {
        RNGestureHandlerModule.registry.detachHandler(entry.value)
      }
    }
  }

  fun dispatchStateChangeEvent(event: RNGestureHandlerStateChangeEvent, newState: Int, oldState: Int) {
    val eventDispatcher = UIManagerHelper.getEventDispatcherForReactTag(reactContext, id)
    // TODO: this event doesn't fit the structure of the codegened one
    eventDispatcher?.dispatchEvent(event)
  }
}
