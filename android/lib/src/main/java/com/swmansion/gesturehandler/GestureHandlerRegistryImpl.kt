package com.swmansion.gesturehandler

import android.view.View
import java.util.*

class GestureHandlerRegistryImpl : GestureHandlerRegistry {
  private val mHandlers = WeakHashMap<View?, ArrayList<GestureHandler<*>>>()
  fun <T : GestureHandler<*>> registerHandlerForView(view: View?, handler: T): T {
    var listToAdd = mHandlers[view]
    if (listToAdd == null) {
      listToAdd = ArrayList(1)
      listToAdd.add(handler)
      mHandlers[view] = listToAdd
    } else {
      listToAdd.add(handler)
    }
    return handler
  }

  override fun getHandlersForView(view: View) = mHandlers[view]
}