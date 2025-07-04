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
  private var attachedHandlers = listOf<Int>()
  private var moduleId: Int = -1
  private var animatedEvents: Boolean = false

  fun setHandlerTags(handlerTags: ReadableArray?) {
    val newHandlers = handlerTags?.toArrayList()?.map { (it as Double).toInt() } ?: emptyList()
    if (moduleId == -1) {
      attachedHandlers = newHandlers
      return
    }

    attachHandlers(newHandlers)
  }

  fun setModuleId(id: Int) {
    if (this.moduleId == -1) {
      this.moduleId = id
      val handlersToAttach = this.attachedHandlers
      this.attachedHandlers = emptyList()
      this.attachHandlers(handlersToAttach)
    } else {
      throw Exception("Tried to change moduleId of a native detector")
    }
  }

  fun setAnimatedEvents(animatedEvents: Boolean) {
    this.animatedEvents = animatedEvents
  }

  private fun attachHandlers(newHandlers: List<Int>) {
    val registry = RNGestureHandlerModule.registries[moduleId]
      ?: throw Exception("Tried to access a non-existent registry")

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
          entry.key,
          this.id,
          if (animatedEvents) {
            GestureHandler.ACTION_TYPE_NATIVE_DETECTOR_ANIMATED_EVENT
          } else {
            GestureHandler.ACTION_TYPE_NATIVE_DETECTOR
          },
        )
      } else if (entry.value == detach) {
        registry.detachHandler(entry.value)
      }
    }
  }

  fun dispatchEvent(event: Event<*>) {
    val eventDispatcher = UIManagerHelper.getEventDispatcherForReactTag(reactContext, id)
    eventDispatcher?.dispatchEvent(event)
  }
}
