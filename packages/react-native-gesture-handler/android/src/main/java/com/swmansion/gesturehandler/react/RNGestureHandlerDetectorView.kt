package com.swmansion.gesturehandler.react

import android.content.Context
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.uimanager.events.Event
import com.facebook.react.views.view.ReactViewGroup
import com.swmansion.gesturehandler.core.GestureHandler

class RNGestureHandlerDetectorView(context: Context) : ReactViewGroup(context) {
  private val reactContext: ThemedReactContext
    get() = context as ThemedReactContext
  private var handlersToAttach: List<Int>? = null
  private var attachedHandlers = listOf<Int>()
  private var moduleId: Int = -1
  private var dispatchAnimatedEvents: Boolean = false

  fun setHandlerTags(handlerTags: ReadableArray?) {
    val newHandlers = handlerTags?.toArrayList()?.map { (it as Double).toInt() } ?: emptyList()
    if (moduleId == -1) {
      // It's possible that handlerTags will be set before module id. In that case, store
      // the handler ids and attach them after setting module id.
      handlersToAttach = newHandlers
      return
    }

    attachHandlers(newHandlers)
  }

  fun setModuleId(id: Int) {
    assert(this.moduleId == -1) { "Tried to change moduleId of a native detector" }

    this.moduleId = id
    this.attachHandlers(handlersToAttach ?: return)
    handlersToAttach = null
  }

  fun setDispatchAnimatedEvents(dispatchAnimatedEvents: Boolean) {
    this.dispatchAnimatedEvents = dispatchAnimatedEvents
  }

  private fun attachHandlers(newHandlers: List<Int>) {
    val registry = RNGestureHandlerModule.registries[moduleId]
      ?: throw Exception("Tried to access a non-existent registry")

    val changes = mutableMapOf<Int, GestureHandlerMutation>()

    for (tag in attachedHandlers) {
      changes[tag] = GestureHandlerMutation.Detach
    }

    for (tag in newHandlers) {
      changes[tag] = if (changes.containsKey(tag)) GestureHandlerMutation.Keep else GestureHandlerMutation.Attach
    }

    for (entry in changes) {
      if (entry.value == GestureHandlerMutation.Attach) {
        registry.attachHandlerToView(
          entry.key,
          this.id,
          if (dispatchAnimatedEvents) {
            GestureHandler.ACTION_TYPE_NATIVE_DETECTOR_ANIMATED_EVENT
          } else {
            GestureHandler.ACTION_TYPE_NATIVE_DETECTOR
          },
        )
      } else if (entry.value == GestureHandlerMutation.Detach) {
        registry.detachHandler(entry.key)
      }
    }
  }

  fun dispatchEvent(event: Event<*>) {
    val eventDispatcher = UIManagerHelper.getEventDispatcherForReactTag(reactContext, id)
    eventDispatcher?.dispatchEvent(event)
  }

  companion object {
    private enum class GestureHandlerMutation {
      Attach,
      Detach,
      Keep,
    }
  }
}
