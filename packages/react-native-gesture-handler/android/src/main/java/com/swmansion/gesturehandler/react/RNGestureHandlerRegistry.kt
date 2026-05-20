package com.swmansion.gesturehandler.react

import android.util.SparseArray
import android.view.View
import com.facebook.react.bridge.UiThreadUtil
import com.swmansion.gesturehandler.core.GestureHandler
import com.swmansion.gesturehandler.core.GestureHandlerRegistry
import java.util.*

class RNGestureHandlerRegistry : GestureHandlerRegistry {
  private val handlers = SparseArray<GestureHandler>()
  private val attachedTo = SparseArray<Int?>()
  private val handlersForView = SparseArray<ArrayList<GestureHandler>>()
  private val observers = mutableMapOf<Int, MutableMap<Any, (GestureHandler) -> Unit>>()

  fun registerHandler(handler: GestureHandler) {
    val callbacks = synchronized(this) {
      handlers.put(handler.tag, handler)
      observers[handler.tag]?.values?.toList().orEmpty()
    }

    if (callbacks.isEmpty()) {
      return
    }

    // `createGestureHandler` runs on the JS thread, but observer callbacks read detector
    // view state (childCount, getChildAt) and may attach native handlers, so they must run
    // on the UI thread.
    val notify = {
      for (callback in callbacks) {
        callback(handler)
      }
    }

    if (UiThreadUtil.isOnUiThread()) {
      notify()
    } else {
      UiThreadUtil.runOnUiThread(notify)
    }
  }

  // Invokes `block` every time a handler with `tag` is registered, and synchronously once now if
  // the handler already exists. The observation persists until explicitly cancelled: the registry
  // holds both `owner` and `block` strongly, so callers MUST call `cancelObservation` or
  // `cancelAllObservationsForOwner` when the owner is going away (typically in detach / dispose
  // paths) to avoid leaking the owner. Observing the same tag twice with the same `owner` replaces
  // the previous block.
  fun observeHandler(tag: Int, owner: Any, block: (GestureHandler) -> Unit) {
    val existing = synchronized(this) {
      observers.getOrPut(tag) { mutableMapOf() }[owner] = block
      handlers[tag]
    }
    existing?.let { block(it) }
  }

  @Synchronized
  fun cancelObservation(tag: Int, owner: Any) {
    val observersForTag = observers[tag] ?: return
    observersForTag.remove(owner)
    if (observersForTag.isEmpty()) {
      observers.remove(tag)
    }
  }

  @Synchronized
  fun cancelAllObservationsForOwner(owner: Any) {
    val iterator = observers.entries.iterator()
    while (iterator.hasNext()) {
      val entry = iterator.next()
      entry.value.remove(owner)
      if (entry.value.isEmpty()) {
        iterator.remove()
      }
    }
  }

  @Synchronized
  fun getHandler(handlerTag: Int): GestureHandler? = handlers[handlerTag]

  @Synchronized
  fun attachHandlerToView(
    handlerTag: Int,
    viewTag: Int,
    actionType: Int,
    hostDetectorView: RNGestureHandlerDetectorView? = null,
  ): Boolean {
    val handler = handlers[handlerTag]
    return handler?.let {
      detachHandlerInternal(handler)
      handler.actionType = actionType
      handler.hostDetectorView = hostDetectorView
      registerHandlerForViewWithTag(viewTag, handler)
      true
    } ?: false
  }

  @Synchronized
  private fun registerHandlerForViewWithTag(viewTag: Int, handler: GestureHandler) {
    check(attachedTo[handler.tag] == null) { "Handler $handler already attached" }
    attachedTo.put(handler.tag, viewTag)
    var listToAdd = handlersForView[viewTag]
    if (listToAdd == null) {
      listToAdd = ArrayList(1)
      listToAdd.add(handler)
      handlersForView.put(viewTag, listToAdd)
    } else {
      synchronized(listToAdd) {
        listToAdd.add(handler)
      }
    }
  }

  @Synchronized
  private fun detachHandlerInternal(handler: GestureHandler) {
    val attachedToView = attachedTo[handler.tag]
    if (attachedToView != null) {
      attachedTo.remove(handler.tag)
      val attachedHandlers = handlersForView[attachedToView]
      if (attachedHandlers != null) {
        synchronized(attachedHandlers) {
          attachedHandlers.remove(handler)
        }

        if (attachedHandlers.size == 0) {
          handlersForView.remove(attachedToView)
        }
      }
    }
    if (handler.view != null) {
      // Handler is in "prepared" state which means it is registered in the orchestrator and can
      // receive touch events. This means that before we remove it from the registry we need to
      // "cancel" it so that orchestrator does no longer keep a reference to it.
      UiThreadUtil.runOnUiThread { handler.cancel() }
    }
  }

  @Synchronized
  fun detachHandlerFromHostDetector(handlerTag: Int, hostDetectorView: RNGestureHandlerDetectorView?) {
    handlers[handlerTag]?.let {
      if (it.hostDetectorView != hostDetectorView) return
      detachHandlerInternal(it)
    }
  }

  @Synchronized
  fun dropHandler(handlerTag: Int) {
    handlers[handlerTag]?.let {
      detachHandlerInternal(it)
      handlers.remove(handlerTag)
    }
  }

  @Synchronized
  fun dropAllHandlers() {
    handlers.clear()
    attachedTo.clear()
    handlersForView.clear()
  }

  @Synchronized
  override fun getHandlersForViewWithTag(viewTag: Int): ArrayList<GestureHandler>? = handlersForView[viewTag]

  @Synchronized
  override fun getHandlersForView(view: View): ArrayList<GestureHandler>? = getHandlersForViewWithTag(view.id)
}
