package com.swmansion.gesturehandler.react

import com.swmansion.gesturehandler.GestureHandlerInteractionController
import android.util.SparseArray
import com.facebook.react.bridge.ReadableMap
import com.swmansion.gesturehandler.GestureHandler

class RNGestureHandlerInteractionManager : GestureHandlerInteractionController {
  private val mWaitForRelations = SparseArray<IntArray>()
  private val mSimultaneousRelations = SparseArray<IntArray>()
  fun dropRelationsForHandlerWithTag(handlerTag: Int) {
    mWaitForRelations.remove(handlerTag)
    mSimultaneousRelations.remove(handlerTag)
  }

  private fun convertHandlerTagsArray(config: ReadableMap, key: String): IntArray {
    val array = config.getArray(key)
    val result = IntArray(array!!.size())
    for (i in result.indices) {
      result[i] = array.getInt(i)
    }
    return result
  }

  fun configureInteractions(handler: GestureHandler<*>, config: ReadableMap) {
    handler.setInteractionController(this)
    if (config.hasKey(KEY_WAIT_FOR)) {
      val tags = convertHandlerTagsArray(config, KEY_WAIT_FOR)
      mWaitForRelations.put(handler.tag, tags)
    }
    if (config.hasKey(KEY_SIMULTANEOUS_HANDLERS)) {
      val tags = convertHandlerTagsArray(config, KEY_SIMULTANEOUS_HANDLERS)
      mSimultaneousRelations.put(handler.tag, tags)
    }
  }

  override fun shouldWaitForHandlerFailure(handler: GestureHandler<*>, otherHandler: GestureHandler<*>): Boolean {
    val waitForTags = mWaitForRelations[handler.tag]
    if (waitForTags != null) {
      for (i in waitForTags.indices) {
        if (waitForTags[i] == otherHandler.tag) {
          return true
        }
      }
    }
    return false
  }

  override fun shouldRequireHandlerToWaitForFailure(
    handler: GestureHandler<*>,
    otherHandler: GestureHandler<*>
  ): Boolean {
    return false
  }

  override fun shouldHandlerBeCancelledBy(handler: GestureHandler<*>, otherHandler: GestureHandler<*>): Boolean {
    return false
  }

  override fun shouldRecognizeSimultaneously(
    handler: GestureHandler<*>,
    otherHandler: GestureHandler<*>
  ): Boolean {
    val simultHandlerTags = mSimultaneousRelations[handler.tag]
    if (simultHandlerTags != null) {
      for (i in simultHandlerTags.indices) {
        if (simultHandlerTags[i] == otherHandler.tag) {
          return true
        }
      }
    }
    return false
  }

  fun reset() {
    mWaitForRelations.clear()
    mSimultaneousRelations.clear()
  }

  companion object {
    private const val KEY_WAIT_FOR = "waitFor"
    private const val KEY_SIMULTANEOUS_HANDLERS = "simultaneousHandlers"
  }
}
