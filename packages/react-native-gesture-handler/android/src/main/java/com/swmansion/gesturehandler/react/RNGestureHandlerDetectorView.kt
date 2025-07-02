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
  private var moduleId: Int = -1

  fun setHandlerTags(handlerTags: ReadableArray?) {
    val registry = RNGestureHandlerModule.registries[moduleId]
      ?: throw Exception("Tried to access a non-existent registry")

    val newHandlers = handlerTags?.toArrayList()?.map { (it as Double).toInt() } ?: emptyList()

    val keep = 0
    val attach = 1
    val detach = 2

    val changes = mutableMapOf<Int, Int>()

    for (tag in attachedHandlers) {
      changes[tag] = detach
    }

    for (tag in newHandlers) {
      changes[tag] = if (changes.containsKey(tag)) keep else attach
    }

    for (entry in changes) {
      if (entry.value == attach) {
        registry.attachHandlerToView(
          entry.value,
          this.id,
          GestureHandler.ACTION_TYPE_NATIVE_DETECTOR,
        )
      } else if (entry.value == detach) {
        registry.detachHandler(entry.value)
      }
    }
  }

  fun setModuleId(id: Int) {
    this.moduleId = id
  }

  fun dispatchStateChangeEvent(event: RNGestureHandlerStateChangeEvent, newState: Int, oldState: Int) {
    val eventDispatcher = UIManagerHelper.getEventDispatcherForReactTag(reactContext, id)
    // TODO: this event doesn't fit the structure of the codegened one
    eventDispatcher?.dispatchEvent(event)
  }
}
