package com.swmansion.gesturehandler.react

import android.util.SparseArray
import android.view.View
import com.facebook.react.bridge.UiThreadUtil
import com.swmansion.gesturehandler.GestureHandler
import com.swmansion.gesturehandler.GestureHandlerRegistry
import java.util.*

class RNGestureHandlerRegistry : GestureHandlerRegistry {
  private val mHandlers = SparseArray<GestureHandler<*>>()
  private val mAttachedTo = SparseArray<Int?>()
  private val mHandlersForView = SparseArray<ArrayList<GestureHandler<*>>>()

  @Synchronized
  fun registerHandler(handler: GestureHandler<*>) {
    mHandlers.put(handler.tag, handler)
  }

  @Synchronized
  fun getHandler(handlerTag: Int): GestureHandler<*>? {
    return mHandlers[handlerTag]
  }

  @Synchronized
  fun attachHandlerToView(handlerTag: Int, viewTag: Int): Boolean {
    val handler = mHandlers[handlerTag]
    return handler?.let {
      detachHandler(handler)
      registerHandlerForViewWithTag(viewTag, handler)
      true
    } ?: false
  }

  @Synchronized
  private fun registerHandlerForViewWithTag(viewTag: Int, handler: GestureHandler<*>) {
    check(mAttachedTo[handler.tag] == null) { "Handler $handler already attached" }
    mAttachedTo.put(handler.tag, viewTag)
    var listToAdd = mHandlersForView[viewTag]
    if (listToAdd == null) {
      listToAdd = ArrayList(1)
      listToAdd.add(handler)
      mHandlersForView.put(viewTag, listToAdd)
    } else {
      listToAdd.add(handler)
    }
  }

  @Synchronized
  private fun detachHandler(handler: GestureHandler<*>) {
    val attachedToView = mAttachedTo[handler.tag]
    if (attachedToView != null) {
      mAttachedTo.remove(handler.tag)
      val attachedHandlers = mHandlersForView[attachedToView]
      if (attachedHandlers != null) {
        attachedHandlers.remove(handler)
        if (attachedHandlers.size == 0) {
          mHandlersForView.remove(attachedToView)
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
  fun dropHandler(handlerTag: Int) {
    mHandlers[handlerTag]?.let {
      detachHandler(it)
      mHandlers.remove(handlerTag)
    }
  }

  @Synchronized
  fun dropAllHandlers() {
    mHandlers.clear()
    mAttachedTo.clear()
    mHandlersForView.clear()
  }

  @Synchronized
  fun getHandlersForViewWithTag(viewTag: Int): ArrayList<GestureHandler<*>>? {
    return mHandlersForView[viewTag]
  }

  @Synchronized
  override fun getHandlersForView(view: View): ArrayList<GestureHandler<*>>? {
    return getHandlersForViewWithTag(view.id)
  }
}