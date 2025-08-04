package com.swmansion.gesturehandler.react

import android.content.Context
import android.view.View
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.uimanager.events.Event
import com.facebook.react.views.view.ReactViewGroup
import com.swmansion.gesturehandler.core.GestureHandler
import com.swmansion.gesturehandler.core.NativeViewGestureHandler

class RNGestureHandlerDetectorView(context: Context) : ReactViewGroup(context) {
  private val reactContext: ThemedReactContext
    get() = context as ThemedReactContext
  private var handlersToAttach: List<Int>? = null
  private var nativeHandlersToAttach: MutableSet<Int> = mutableSetOf()
  private var attachedHandlers: MutableSet<Int> = mutableSetOf()
  private var moduleId: Int = -1
  private var dispatchesAnimatedEvents: Boolean = false

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

  fun setDispatchesAnimatedEvents(dispatchesAnimatedEvents: Boolean) {
    this.dispatchesAnimatedEvents = dispatchesAnimatedEvents
  }

  private fun shouldAttachGestureToSubview(tag: Int): Boolean {
    val registry = RNGestureHandlerModule.registries[moduleId]
      ?: throw Exception("Tried to access a non-existent registry")

    return registry.getHandler(tag) is NativeViewGestureHandler
  }

  // We override this `addView` because it is called inside `addView(child: View?, index: Int)`
  override fun addView(child: View?, index: Int, params: LayoutParams?) {
    super.addView(child, index, params)

    if (child == null) {
      throw Exception(
        "[react-native-gesture-handler] Cannot attach gesture handler. NativeGestureDetector got null as child.",
      )
    }

    maybeAttachNativeGestureHandlers(child.id)
  }

  override fun removeViewAt(index: Int) {
    detachNativeGestureHandlers()

    super.removeViewAt(index)
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
      val tag = entry.key

      if (entry.value == GestureHandlerMutation.Attach) {
        // It might happen that `attachHandlers` will be called before children are added into view hierarchy. In that case we cannot
        // attach `NativeViewGestureHandlers` here and we have to do it in `addView` method.
        if (shouldAttachGestureToSubview(tag)) {
          nativeHandlersToAttach.add(tag)
        } else {
          registry.attachHandlerToView(tag, this.id, GestureHandler.ACTION_TYPE_NATIVE_DETECTOR)

          attachedHandlers.add(tag)
        }
      } else if (entry.value == GestureHandlerMutation.Detach) {
        registry.detachHandler(tag)
        attachedHandlers.remove(tag)
      }
    }

    // This covers the case where `NativeViewGestureHandlers` are attached after child views were created.
    val child = getChildAt(0)

    if (child != null) {
      maybeAttachNativeGestureHandlers(child.id)
    }
  }

  private fun maybeAttachNativeGestureHandlers(childId: Int) {
    val registry = RNGestureHandlerModule.registries[moduleId]
      ?: throw Exception("Tried to access a non-existent registry")

    for (tag in nativeHandlersToAttach) {
      if (tag in attachedHandlers) {
        continue
      }

      registry.attachHandlerToView(tag, childId, GestureHandler.ACTION_TYPE_NATIVE_DETECTOR)

      attachedHandlers.add(tag)
    }

    nativeHandlersToAttach.clear()
  }

  private fun detachNativeGestureHandlers() {
    val registry = RNGestureHandlerModule.registries[moduleId]
      ?: throw Exception("Tried to access a non-existent registry")

    for (tag in attachedHandlers) {
      if (shouldAttachGestureToSubview(tag)) {
        registry.detachHandler(tag)
        attachedHandlers.remove(tag)
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
