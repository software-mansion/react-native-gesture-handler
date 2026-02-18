package com.swmansion.gesturehandler.react

import android.content.Context
import android.view.View
import android.view.ViewGroup
import androidx.core.view.isNotEmpty
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.uimanager.events.Event
import com.facebook.react.views.swiperefresh.ReactSwipeRefreshLayout
import com.facebook.react.views.view.ReactViewGroup
import com.swmansion.gesturehandler.core.GestureHandler
import com.swmansion.gesturehandler.react.RNGestureHandlerRootView

class RNGestureHandlerDetectorView(context: Context) : ReactViewGroup(context) {
  private val reactContext: ThemedReactContext
    get() = context as ThemedReactContext
  private var handlersToAttach: List<Int>? = null
  private var virtualChildrenToAttach: List<VirtualChildren>? = null
  private var nativeHandlers: MutableSet<Int> = mutableSetOf()
  private var attachedHandlers: MutableSet<Int> = mutableSetOf()
  private var attachedVirtualHandlers: MutableMap<Int, MutableSet<Int>> = mutableMapOf()
  private var moduleId: Int = -1

  data class VirtualChildren(val handlerTags: List<Int>, val viewTag: Int)

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

  override fun onAttachedToWindow() {
    super.onAttachedToWindow()

    if (moduleId != -1) {
      handlersToAttach?.let {
        attachHandlers(it)
      }

      virtualChildrenToAttach?.let {
        attachVirtualChildren(it)
      }

      handlersToAttach = null
      virtualChildrenToAttach = null
    }
  }

  override fun onDetachedFromWindow() {
    if (attachedHandlers.isNotEmpty()) {
      handlersToAttach = attachedHandlers.toMutableList().also {
        it.addAll(handlersToAttach ?: emptyList())
      }
    }

    if (attachedVirtualHandlers.isNotEmpty()) {
      virtualChildrenToAttach = attachedVirtualHandlers.map {
        VirtualChildren(it.value.toList(), it.key)
      }.toMutableList().also {
        it.addAll(virtualChildrenToAttach ?: emptyList())
      }
    }

    detachAllHandlers()

    super.onDetachedFromWindow()
  }

  fun setModuleId(id: Int) {
    assert(this.moduleId == -1) { "Tried to change moduleId of a native detector" }

    this.moduleId = id
    this.attachHandlers(handlersToAttach ?: return)
    handlersToAttach = null
    this.attachVirtualChildren(virtualChildrenToAttach ?: return)
    virtualChildrenToAttach = null
  }

  fun setVirtualChildren(newVirtualChildren: ReadableArray?) {
    val mappedChildren = newVirtualChildren?.mapVirtualChildren().orEmpty()

    if (moduleId == -1) {
      // It's possible that handlerTags will be set before module id. In that case, store
      // the handler ids and attach them after setting module id.
      virtualChildrenToAttach = mappedChildren
      return
    }

    attachVirtualChildren(mappedChildren)
  }

  private fun shouldAttachGestureToChildView(tag: Int): Boolean {
    val registry = RNGestureHandlerModule.registries[moduleId]
      ?: throw Exception("Tried to access a non-existent registry")

    return registry.getHandler(tag)?.wantsToAttachDirectlyToView() ?: false
  }

  // We override this `addView` because it is called inside `addView(child: View?, index: Int)`
  override fun addView(child: View, index: Int, params: LayoutParams?) {
    super.addView(child, index, params)

    tryAttachNativeHandlersToChildView(child)
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
          registry.attachHandlerToView(tag, viewTag, actionType, this)
          if (actionType == GestureHandler.ACTION_TYPE_VIRTUAL_DETECTOR) {
            registry.getHandler(tag)?.hostDetectorView = this
          }
          attachedHandlers.add(tag)
        }
      }
    }

    for (tag in handlersToDetach) {
      registry.detachHandlerFromHostDetector(tag, this)
      nativeHandlers.remove(tag)
      attachedHandlers.remove(tag)
    }

    val child = getChildAt(0)

    // This covers the case where `NativeViewGestureHandlers` are attached after child views were created.
    if (child != null) {
      tryAttachNativeHandlersToChildView(child)
    }
  }

  private fun attachVirtualChildren(virtualChildrenToAttach: List<VirtualChildren>) {
    val virtualChildrenToDetach = attachedVirtualHandlers.keys.toMutableSet()

    for (child in virtualChildrenToAttach) {
      virtualChildrenToDetach.remove(child.viewTag)
    }

    val registry = RNGestureHandlerModule.registries[moduleId]
      ?: throw Exception("Tried to access a non-existent registry")

    for (child in virtualChildrenToDetach) {
      for (tag in attachedVirtualHandlers[child]!!) {
        registry.detachHandlerFromHostDetector(tag, this)
      }
      attachedVirtualHandlers.remove(tag)
    }

    for (child in virtualChildrenToAttach) {
      if (!attachedVirtualHandlers.containsKey(child.viewTag)) {
        attachedVirtualHandlers[child.viewTag] = mutableSetOf()
      }

      attachHandlers(
        child.handlerTags,
        child.viewTag,
        GestureHandler.ACTION_TYPE_VIRTUAL_DETECTOR,
        attachedVirtualHandlers[child.viewTag]!!,
      )
    }
  }

  private fun tryAttachNativeHandlersToChildView(child: View) {
    val registry = RNGestureHandlerModule.registries[moduleId]
      ?: throw Exception("Tried to access a non-existent registry")

    // In the native view hierarchy, a ScrollView is a child of a RefreshControl.
    // When attaching Native gestures to a ScrollView, first check if it is wrapped by a RefreshControl.
    // If so, attach the handler to the child of RefreshControl, not the RefreshControl itself.
    // Note: RefreshControl is wrapped with a VirtualDetector, and native gestures for it are attached in `attachVirtualChildren`.
    val id = if (child is ReactSwipeRefreshLayout) {
      child.getChildAt(0).id
      // TODO: figure out how to do it correctly
    } else if (child is ViewGroup && child.isNotEmpty()) {
      child.tryFindGestureHandlerButton()?.id ?: child.id
    } else {
      child.id
    }

    for (tag in nativeHandlers) {
      registry.attachHandlerToView(tag, id, GestureHandler.ACTION_TYPE_NATIVE_DETECTOR, this)

      attachedHandlers.add(tag)
    }
  }

  private fun detachNativeGestureHandlers() {
    val registry = RNGestureHandlerModule.registries[moduleId]
      ?: throw Exception("Tried to access a non-existent registry")

    for (tag in nativeHandlers) {
      registry.detachHandlerFromHostDetector(tag, this)
      attachedHandlers.remove(tag)
    }
  }

  fun dispatchEvent(event: Event<*>) {
    val eventDispatcher = UIManagerHelper.getEventDispatcherForReactTag(reactContext, id)
    eventDispatcher?.dispatchEvent(event)
  }

  fun detachAllHandlers() {
    val registry = RNGestureHandlerModule.registries[moduleId]
      ?: throw Exception("Tried to access a non-existent registry")

    for (tag in attachedHandlers.toMutableSet()) {
      registry.detachHandlerFromHostDetector(tag, this)
      attachedHandlers.remove(tag)
    }

    for (child in attachedVirtualHandlers) {
      for (tag in child.value) {
        registry.detachHandlerFromHostDetector(tag, this)
      }
      child.value.clear()
    }
  }

  fun recordHandlerIfNotPresent(handler: GestureHandler) {
    RNGestureHandlerRootView.findGestureHandlerRootView(this)?.recordHandlerIfNotPresent(handler)
  }

  private fun ReadableArray.mapVirtualChildren(): List<VirtualChildren> = List(size()) { i ->
    val child = getMap(i) ?: return@List null
    val handlerTags = child.getArray("handlerTags")?.toIntList().orEmpty()
    val viewTag = child.getInt("viewTag")

    VirtualChildren(handlerTags, viewTag)
  }.filterNotNull()

  private fun ReadableArray.toIntList(): List<Int> = List(size()) { getInt(it) }

  private fun ViewGroup.tryFindGestureHandlerButton(): RNGestureHandlerButtonViewManager.ButtonViewGroup? {
    if (isNotEmpty()) {
      val child = getChildAt(0)
      if (child is RNGestureHandlerButtonViewManager.ButtonViewGroup) {
        return child
      }
    }

    return null
  }
}
