package com.swmansion.gesturehandler.react.events

import androidx.core.util.Pools
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.PixelUtil
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.uimanager.events.Event
import com.swmansion.gesturehandler.core.NativeViewGestureHandler
import com.swmansion.gesturehandler.react.RNGestureHandlerButtonViewManager

class RNGestureHandlerButtonEvent private constructor() : Event<RNGestureHandlerButtonEvent>() {
  private lateinit var type: RNGestureHandlerButtonViewManager.ButtonViewGroup.EventType
  private lateinit var eventData: ButtonEventData

  private fun init(
    button: RNGestureHandlerButtonViewManager.ButtonViewGroup,
    handler: NativeViewGestureHandler,
    type: RNGestureHandlerButtonViewManager.ButtonViewGroup.EventType,
  ) {
    super.init(UIManagerHelper.getSurfaceId(button), button.id)

    this.type = type
    this.eventData = ButtonEventData(
      x = PixelUtil.toDIPFromPixel(handler.lastRelativePositionX).toDouble(),
      y = PixelUtil.toDIPFromPixel(handler.lastRelativePositionY).toDouble(),
      absoluteX = PixelUtil.toDIPFromPixel(handler.lastPositionInWindowX).toDouble(),
      absoluteY = PixelUtil.toDIPFromPixel(handler.lastPositionInWindowY).toDouble(),
      numberOfPointers = handler.numberOfPointers,
      pointerType = handler.pointerType,
      pointerInside = handler.isWithinBounds,
    )
  }

  override fun onDispose() {
    EVENTS_POOL.release(this)
  }

  override fun getEventName() = when (type) {
    RNGestureHandlerButtonViewManager.ButtonViewGroup.EventType.Press -> ON_PRESS_EVENT_NAME
    RNGestureHandlerButtonViewManager.ButtonViewGroup.EventType.PressIn -> ON_PRESS_IN_EVENT_NAME
    RNGestureHandlerButtonViewManager.ButtonViewGroup.EventType.PressOut -> ON_PRESS_OUT_EVENT_NAME
    RNGestureHandlerButtonViewManager.ButtonViewGroup.EventType.LongPress -> ON_LONG_PRESS_EVENT_NAME
    RNGestureHandlerButtonViewManager.ButtonViewGroup.EventType.InteractionFinished ->
      ON_INTERACTION_FINISHED_EVENT_NAME
  }

  // Unfortunately getCoalescingKey is not considered when sending event to C++, therefore we have to disable coalescing in v3
  override fun canCoalesce() = false

  override fun getCoalescingKey(): Short = 0

  override fun getEventData(): WritableMap = this.eventData.toWritableMap()

  private data class ButtonEventData(
    val x: Double,
    val y: Double,
    val absoluteX: Double,
    val absoluteY: Double,
    val numberOfPointers: Int,
    val pointerType: Int,
    val pointerInside: Boolean,
  ) {
    fun toWritableMap(): WritableMap = Arguments.createMap().apply {
      putDouble("x", x)
      putDouble("y", y)
      putDouble("absoluteX", absoluteX)
      putDouble("absoluteY", absoluteY)
      putInt("numberOfPointers", numberOfPointers)
      putInt("pointerType", pointerType)
      putBoolean("pointerInside", pointerInside)
    }
  }

  companion object {
    private const val ON_PRESS_EVENT_NAME = "onButtonPress"
    private const val ON_PRESS_IN_EVENT_NAME = "onButtonPressIn"
    private const val ON_PRESS_OUT_EVENT_NAME = "onButtonPressOut"
    private const val ON_LONG_PRESS_EVENT_NAME = "onButtonLongPress"
    private const val ON_INTERACTION_FINISHED_EVENT_NAME = "onButtonInteractionFinished"

    private const val TOUCH_EVENTS_POOL_SIZE = 7 // magic
    private val EVENTS_POOL = Pools.SynchronizedPool<RNGestureHandlerButtonEvent>(TOUCH_EVENTS_POOL_SIZE)

    fun obtain(
      button: RNGestureHandlerButtonViewManager.ButtonViewGroup,
      handler: NativeViewGestureHandler,
      type: RNGestureHandlerButtonViewManager.ButtonViewGroup.EventType,
    ): RNGestureHandlerButtonEvent = (EVENTS_POOL.acquire() ?: RNGestureHandlerButtonEvent()).apply {
      init(button, handler, type)
    }
  }
}
