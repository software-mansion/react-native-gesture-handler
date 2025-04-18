package com.swmansion.gesturehandler.react

import com.swmansion.gesturehandler.core.FlingGestureHandler
import com.swmansion.gesturehandler.core.GestureHandler
import com.swmansion.gesturehandler.core.HoverGestureHandler
import com.swmansion.gesturehandler.core.LongPressGestureHandler
import com.swmansion.gesturehandler.core.ManualGestureHandler
import com.swmansion.gesturehandler.core.NativeViewGestureHandler
import com.swmansion.gesturehandler.core.PanGestureHandler
import com.swmansion.gesturehandler.core.PinchGestureHandler
import com.swmansion.gesturehandler.core.RotationGestureHandler
import com.swmansion.gesturehandler.core.TapGestureHandler

object RNGestureHandlerFactoryUtil {
  private val handlerFactories = arrayOf<GestureHandler.Factory<*>>(
    NativeViewGestureHandler.Factory(),
    TapGestureHandler.Factory(),
    LongPressGestureHandler.Factory(),
    PanGestureHandler.Factory(),
    PinchGestureHandler.Factory(),
    RotationGestureHandler.Factory(),
    FlingGestureHandler.Factory(),
    ManualGestureHandler.Factory(),
    HoverGestureHandler.Factory(),
  )

  @Suppress("UNCHECKED_CAST")
  fun <T : GestureHandler> findFactoryForHandler(handler: GestureHandler): GestureHandler.Factory<GestureHandler>? =
    handlerFactories.firstOrNull { it.type == handler.javaClass } as GestureHandler.Factory<GestureHandler>?

  @Suppress("UNCHECKED_CAST")
  fun <T : GestureHandler> findFactoryForName(handlerName: String): GestureHandler.Factory<GestureHandler>? =
    handlerFactories.firstOrNull { it.name == handlerName } as GestureHandler.Factory<GestureHandler>?
}
