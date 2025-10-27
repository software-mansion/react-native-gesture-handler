package com.swmansion.gesturehandler.react

import android.content.Context
import android.view.View
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
  private var nativeHandlers: MutableSet<Int> = mutableSetOf()
  private var attachedHandlers: MutableSet<Int> = mutableSetOf()
  private var attachedLogicHandlers: MutableMap<Int, MutableSet<Int>> = mutableMapOf()
  private var moduleId: Int = -1

  data class LogicChildren(val handlerTags: List<Int>, val viewTag: Int)

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

  fun setLogicChildren(newLogicChildren: ReadableArray?) {
    val logicChildrenToDetach = attachedLogicHandlers.keys.toMutableSet()

    val mappedChildren = newLogicChildren?.mapLogicChildren().orEmpty()
    for (child in mappedChildren) {
      logicChildrenToDetach.remove(child.viewTag)
    }

    val registry = RNGestureHandlerModule.registries[moduleId]
      ?: throw Exception("Tried to access a non-existent registry")

    for (child in logicChildrenToDetach) {
      for (tag in attachedLogicHandlers[child]!!) {
        registry.detachHandler(tag)
      }
      attachedLogicHandlers.remove(tag)
    }

    for (child in mappedChildren) {
      if (!attachedLogicHandlers.containsKey(child.viewTag)) {
        attachedLogicHandlers[child.viewTag] = mutableSetOf()
      }

      attachHandlers(
        child.handlerTags,
        child.viewTag,
        GestureHandler.ACTION_TYPE_LOGIC_DETECTOR,
        attachedLogicHandlers[child.viewTag]!!,
      )
    }
  }

  private fun shouldAttachGestureToChildView(tag: Int): Boolean {
    val registry = RNGestureHandlerModule.registries[moduleId]
      ?: throw Exception("Tried to access a non-existent registry")

    return registry.getHandler(tag)?.wantsToAttachDirectlyToView() ?: false
  }

  // We override this `addView` because it is called inside `addView(child: View?, index: Int)`
  override fun addView(child: View, index: Int, params: LayoutParams?) {
    super.addView(child, index, params)

    tryAttachNativeHandlersToChildView(child.id)
  }

  override fun removeViewAt(index: Int) {
    detachNativeGestureHandlers()

    super.removeViewAt(index)
  }

  private fun attachHandlers(
    newHandlers: List<Int>,
    viewTag: Int = this.id,
    actionType: Int = GestureHandler.ACTION_TYPE_NATIVE_DETECTOR,
    attachedHandlers: MutableSet<Int> = this.attachedHandlers,
  ) {
    val registry = RNGestureHandlerModule.registries[moduleId]
      ?: throw Exception("Tried to access a non-existent registry")

    val handlersToDetach = attachedHandlers.toMutableSet()

    for (tag in newHandlers) {
      handlersToDetach.remove(tag)
      if (!attachedHandlers.contains(tag)) {
        if (shouldAttachGestureToChildView(tag) && actionType == GestureHandler.ACTION_TYPE_NATIVE_DETECTOR) {
          // It might happen that `attachHandlers` will be called before children are added into view hierarchy. In that case we cannot
          // attach `NativeViewGestureHandlers` here and we have to do it in `addView` method.
          nativeHandlers.add(tag)
        } else {
          registry.attachHandlerToView(tag, viewTag, actionType)
          if (actionType == GestureHandler.ACTION_TYPE_LOGIC_DETECTOR) {
            registry.getHandler(tag)?.hostDetectorView = this
          }
          attachedHandlers.add(tag)
        }
      }
    }

    for (tag in handlersToDetach) {
      registry.detachHandler(tag)
      nativeHandlers.remove(tag)
      attachedHandlers.remove(tag)
    }

    val child = getChildAt(0)

    // This covers the case where `NativeViewGestureHandlers` are attached after child views were created.
    if (child != null) {
      tryAttachNativeHandlersToChildView(child.id)
    }
  }

  private fun tryAttachNativeHandlersToChildView(childId: Int) {
    val registry = RNGestureHandlerModule.registries[moduleId]
      ?: throw Exception("Tried to access a non-existent registry")

    for (tag in nativeHandlers) {
      registry.attachHandlerToView(tag, childId, GestureHandler.ACTION_TYPE_NATIVE_DETECTOR)

      attachedHandlers.add(tag)
    }
  }

  private fun detachNativeGestureHandlers() {
    val registry = RNGestureHandlerModule.registries[moduleId]
      ?: throw Exception("Tried to access a non-existent registry")

    for (tag in nativeHandlers) {
      registry.detachHandler(tag)
      attachedHandlers.remove(tag)
    }
  }

  fun dispatchEvent(event: Event<*>) {
    val eventDispatcher = UIManagerHelper.getEventDispatcherForReactTag(reactContext, id)
    eventDispatcher?.dispatchEvent(event)
  }

  fun onViewDrop() {
    val registry = RNGestureHandlerModule.registries[moduleId]
      ?: throw Exception("Tried to access a non-existent registry")

    for (tag in attachedHandlers.toMutableSet()) {
      registry.detachHandler(tag)
      attachedHandlers.remove(tag)
    }

    for (child in attachedLogicHandlers) {
      for (tag in child.value) {
        registry.detachHandler(tag)
      }
      child.value.clear()
    }
  }

  private fun ReadableArray.mapLogicChildren(): List<LogicChildren> = List(size()) { i ->
    val child = getMap(i) ?: return@List null
    val handlerTags = child.getArray("handlerTags")?.toIntList().orEmpty()
    val viewTag = child.getInt("viewTag")

    LogicChildren(handlerTags, viewTag)
  }.filterNotNull()

  private fun ReadableArray.toIntList(): List<Int> = List(size()) { getInt(it) }
}
