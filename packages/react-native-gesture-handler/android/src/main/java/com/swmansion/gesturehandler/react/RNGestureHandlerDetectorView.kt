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
  private var moduleId: Int = -1
  private var logicChildren: HashMap<Int, MutableSet<Int>> = hashMapOf()

  data class LogicProps(val handlerTags: List<Int>, val moduleId: Int, val viewTag: Int)

  fun setHandlerTags(handlerTags: ReadableArray?) {
    val newHandlers = handlerTags?.toArrayList()?.map { (it as Double).toInt() } ?: emptyList()
    if (moduleId == -1) {
      // It's possible that handlerTags will be set before module id. In that case, store
      // the handler ids and attach them after setting module id.
      handlersToAttach = newHandlers
      return
    }

    attachHandlers(newHandlers, this.id, false, attachedHandlers)
  }

  fun setModuleId(id: Int) {
    assert(this.moduleId == -1) { "Tried to change moduleId of a native detector" }

    this.moduleId = id
    this.attachHandlers(handlersToAttach ?: return, this.id, false, attachedHandlers)
    handlersToAttach = null
  }

  fun setLogicChildren(newLogicChildren: ReadableArray?) {
    val logicChildrenToDelete = HashSet<Int>()

    for (child in logicChildren) {
      logicChildrenToDelete.add(child.key)
    }

    val mappedChildren = mutableListOf<LogicProps>()

    for (i in 0 until newLogicChildren!!.size()) {
      val child = newLogicChildren.getMap(i) // Each element should be a ReadableMap

      val handlerTagsArray = child!!.getArray("handlerTags")
      val handlerTags = mutableListOf<Int>()
      for (j in 0 until handlerTagsArray!!.size()) {
        handlerTags.add(handlerTagsArray.getInt(j))
      }

      val moduleId = child.getInt("moduleId")
      val viewTag = child.getInt("viewTag")

      mappedChildren.add(
        LogicProps(
          handlerTags = handlerTags,
          moduleId = moduleId,
          viewTag = viewTag,
        ),
      )
    }

    for (child in mappedChildren) {
      if (!logicChildren.containsKey(child.viewTag)) {
        logicChildren.put(child.viewTag, mutableSetOf())
      }
      logicChildrenToDelete.remove(child.viewTag)
      attachHandlers(
        child.handlerTags,
        child.viewTag,
        true,
        logicChildren[child.viewTag]!!,
      )
    }

    for (childTag in logicChildrenToDelete) {
      val registry = RNGestureHandlerModule.registries[moduleId]
        ?: throw Exception("Tried to access a non-existent registry")
      registry.detachHandler(childTag)
      logicChildren.remove(childTag)
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
    viewTag: Int,
    isLogic: Boolean,
    attachedHandlers: MutableSet<Int>,
  ) {
    val registry = RNGestureHandlerModule.registries[moduleId]
      ?: throw Exception("Tried to access a non-existent registry")

    val changes = mutableMapOf<Int, GestureHandlerMutation>()

    for (tag in attachedHandlers) {
      changes[tag] = GestureHandlerMutation.Detach
    }

    for (tag in newHandlers) {
      changes[tag] = if (changes.containsKey(tag)) GestureHandlerMutation.Keep else GestureHandlerMutation.Attach
    }

    val actionType = if (isLogic) {
      GestureHandler.ACTION_TYPE_LOGIC_DETECTOR
    } else {
      GestureHandler.ACTION_TYPE_NATIVE_DETECTOR
    }

    for (entry in changes) {
      val tag = entry.key

      if (entry.value == GestureHandlerMutation.Attach) {
        if (shouldAttachGestureToChildView(tag)) {
          // It might happen that `attachHandlers` will be called before children are added into view hierarchy. In that case we cannot
          // attach `NativeViewGestureHandlers` here and we have to do it in `addView` method.
          nativeHandlers.add(tag)
        } else {
          registry.attachHandlerToView(tag, viewTag, actionType)
          if (isLogic) {
            registry.getHandler(tag)?.parentView = this
          }
          attachedHandlers.add(tag)
        }
      } else if (entry.value == GestureHandlerMutation.Detach) {
        registry.detachHandler(tag)
        nativeHandlers.remove(tag)
        attachedHandlers.remove(tag)
      }
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

    for (child in logicChildren) {
      for (tag in child.value) {
        registry.detachHandler(tag)
      }
      child.value.clear()
    }
  }

  companion object {
    private enum class GestureHandlerMutation {
      Attach,
      Detach,
      Keep,
    }
  }
}
