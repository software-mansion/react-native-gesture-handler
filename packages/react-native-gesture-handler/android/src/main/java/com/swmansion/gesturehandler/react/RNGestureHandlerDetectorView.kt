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
  private var handlersToAttach: List<Int> = emptyList()
  private var virtualChildrenToAttach: List<VirtualChildren> = emptyList()
  private var nativeHandlers: MutableSet<Int> = mutableSetOf()
  private var subscribedHandlers: MutableSet<Int> = mutableSetOf()
  private var attachedHandlers: MutableSet<Int> = mutableSetOf()
  private var subscribedVirtualHandlers: MutableMap<Int, MutableSet<Int>> = mutableMapOf()
  private var moduleId: Int = -1

  data class VirtualChildren(val handlerTags: List<Int>, val viewTag: Int)

  fun setHandlerTags(handlerTags: ReadableArray?) {
    handlersToAttach = handlerTags?.toArrayList()?.map { (it as Double).toInt() } ?: emptyList()
    if (moduleId != -1) {
      attachHandlers(handlersToAttach)
    }
  }

  override fun onAttachedToWindow() {
    super.onAttachedToWindow()
    if (moduleId != -1) {
      attachHandlers(handlersToAttach)
      attachVirtualChildren(virtualChildrenToAttach)
    }
  }

  override fun onDetachedFromWindow() {
    detachAllHandlers()
    super.onDetachedFromWindow()
  }

  fun setModuleId(id: Int) {
    assert(this.moduleId == -1) { "Tried to change moduleId of a native detector" }

    this.moduleId = id
    attachHandlers(handlersToAttach)
    attachVirtualChildren(virtualChildrenToAttach)
  }

  fun setVirtualChildren(newVirtualChildren: ReadableArray?) {
    virtualChildrenToAttach = newVirtualChildren?.mapVirtualChildren().orEmpty()
    if (moduleId != -1) {
      attachVirtualChildren(virtualChildrenToAttach)
    }
  }

  // We override this `addView` because it is called inside `addView(child: View?, index: Int)`
  override fun addView(child: View, index: Int, params: LayoutParams?) {
    super.addView(child, index, params)

    if (nativeHandlers.isNotEmpty()) {
      assert(childCount == 1) {
        "Cannot have more than one child view when native gesture handlers are attached to the detector"
      }
    }

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
    subscribedHandlers: MutableSet<Int> = this.subscribedHandlers,
  ) {
    val registry = RNGestureHandlerModule.registries[moduleId]
      ?: throw Exception("Tried to access a non-existent registry")

    val handlersToDetach = subscribedHandlers.toMutableSet()

    for (tag in newHandlers) {
      handlersToDetach.remove(tag)
      if (!subscribedHandlers.contains(tag)) {
        registry.observeHandler(tag, this) { handler ->
          attachReadyHandler(handler, actionType, viewTag)
        }
        subscribedHandlers.add(tag)
      }
    }

    for (tag in handlersToDetach) {
      registry.cancelObservation(tag, this)
      if (attachedHandlers.contains(tag)) {
        registry.detachHandlerFromHostDetector(tag, this)
        attachedHandlers.remove(tag)
      }
      subscribedHandlers.remove(tag)
      nativeHandlers.remove(tag)
    }
  }

  // Invoked from the registry's `observeHandler` callback once the handler is known to exist.
  // Branches on handler kind + actionType to pick the right binding flow. May be called multiple
  // times for the same tag (handler re-registration), so each branch must be idempotent.
  private fun attachReadyHandler(handler: GestureHandler, actionType: Int, viewTag: Int) {
    val registry = RNGestureHandlerModule.registries[moduleId]
      ?: throw Exception("Tried to access a non-existent registry")

    if (handler.wantsToAttachDirectlyToView() && actionType == GestureHandler.ACTION_TYPE_NATIVE_DETECTOR) {
      assert(childCount <= 1) {
        "Cannot attach native gesture handlers when the detector has multiple children"
      }
      nativeHandlers.add(handler.tag)
      if (childCount != 0) {
        tryAttachNativeHandlersToChildView(getChildAt(0))
      }
      return
    }

    registry.attachHandlerToView(handler.tag, viewTag, actionType, this)
    if (actionType == GestureHandler.ACTION_TYPE_VIRTUAL_DETECTOR) {
      handler.hostDetectorView = this
    }
    attachedHandlers.add(handler.tag)
  }

  private fun attachVirtualChildren(virtualChildrenToAttach: List<VirtualChildren>) {
    val virtualChildrenToDetach = subscribedVirtualHandlers.keys.toMutableSet()

    for (child in virtualChildrenToAttach) {
      virtualChildrenToDetach.remove(child.viewTag)
    }

    val registry = RNGestureHandlerModule.registries[moduleId]
      ?: throw Exception("Tried to access a non-existent registry")

    for (child in virtualChildrenToDetach) {
      for (tag in subscribedVirtualHandlers[child]!!) {
        registry.cancelObservation(tag, this)
        if (attachedHandlers.contains(tag)) {
          registry.detachHandlerFromHostDetector(tag, this)
          attachedHandlers.remove(tag)
        }
      }
      subscribedVirtualHandlers.remove(child)
    }

    for (child in virtualChildrenToAttach) {
      if (!subscribedVirtualHandlers.containsKey(child.viewTag)) {
        subscribedVirtualHandlers[child.viewTag] = mutableSetOf()
      }

      attachHandlers(
        child.handlerTags,
        child.viewTag,
        GestureHandler.ACTION_TYPE_VIRTUAL_DETECTOR,
        subscribedVirtualHandlers[child.viewTag]!!,
      )
    }
  }

  private fun tryAttachNativeHandlersToChildView(child: View) {
    if (nativeHandlers.isEmpty()) {
      return
    }

    assert(childCount == 1) {
      "Cannot have more than one child view when native gesture handlers are attached to the detector"
    }

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
      // Defensive: a tag may be in `nativeHandlers` from an earlier ready callback but the
      // underlying handler may have been dropped since. Skip; a re-registration will fire the
      // observation again.
      if (registry.getHandler(tag) == null) {
        continue
      }
      registry.attachHandlerToView(tag, id, GestureHandler.ACTION_TYPE_NATIVE_DETECTOR, this)
      attachedHandlers.add(tag)
    }
  }

  private fun detachNativeGestureHandlers() {
    val registry = RNGestureHandlerModule.registries[moduleId]
      ?: throw Exception("Tried to access a non-existent registry")

    for (tag in nativeHandlers) {
      if (!attachedHandlers.contains(tag)) {
        continue
      }
      registry.detachHandlerFromHostDetector(tag, this)
      attachedHandlers.remove(tag)
    }
  }

  fun dispatchEvent(event: Event<*>) {
    val eventDispatcher = UIManagerHelper.getEventDispatcherForReactTag(reactContext, id)
    eventDispatcher?.dispatchEvent(event)
  }

  fun detachAllHandlers() {
    RNGestureHandlerModule.registries[moduleId]?.let { registry ->
      registry.cancelAllObservationsForOwner(this)
      for (tag in attachedHandlers) {
        registry.detachHandlerFromHostDetector(tag, this)
      }
    }
    attachedHandlers.clear()
    subscribedVirtualHandlers.clear()
    subscribedHandlers.clear()
    nativeHandlers.clear()
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
