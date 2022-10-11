package com.swmansion.gesturehandler.lib

import android.view.View
import java.util.*

interface GestureHandlerRegistry {
  fun getHandlersForView(view: View): ArrayList<GestureHandler<*>>?
}
