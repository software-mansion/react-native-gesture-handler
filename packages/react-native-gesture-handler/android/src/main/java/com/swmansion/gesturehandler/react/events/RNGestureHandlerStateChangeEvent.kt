package com.swmansion.gesturehandler.react.events

import androidx.core.util.Pools
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.uimanager.events.Event
import com.swmansion.gesturehandler.core.GestureHandler
import com.swmansion.gesturehandler.react.events.eventbuilders.GestureHandlerEventDataBuilder

class RNGestureHandlerStateChangeEvent private constructor() : Event<RNGestureHandlerStateChangeEvent>() {
  private var dataBuilder: GestureHandlerEventDataBuilder<*>? = null
  private var newState: Int = GestureHandler.STATE_UNDETERMINED
  private var oldState: Int = GestureHandler.STATE_UNDETERMINED
  private var actionType: Int = GestureHandler.ACTION_TYPE_NATIVE_ANIMATED_EVENT
  private lateinit var eventHandlerType: EventHandlerType

  private fun <T : GestureHandler> init(
    handler: T,
    newState: Int,
    oldState: Int,
    actionType: Int,
    dataBuilder: GestureHandlerEventDataBuilder<T>,
    eventHandlerType: EventHandlerType,
  ) {
    val view = handler.viewForEvents

    super.init(UIManagerHelper.getSurfaceId(view), view.id)

    this.dataBuilder = dataBuilder
    this.newState = newState
    this.oldState = oldState
    this.actionType = actionType
    this.eventHandlerType = eventHandlerType
  }

  override fun onDispose() {
    dataBuilder = null
    newState = GestureHandler.STATE_UNDETERMINED
    oldState = GestureHandler.STATE_UNDETERMINED
    EVENTS_POOL.release(this)
  }

  override fun getEventName() = if (GestureHandler.usesNativeOrVirtualDetector(actionType)) {
    if (eventHandlerType == EventHandlerType.ForReanimated) REANIMATED_EVENT_NAME else EVENT_NAME
  } else {
    EVENT_NAME
  }

  // TODO: coalescing
  override fun canCoalesce() = false

  // TODO: coalescing
  override fun getCoalescingKey(): Short = 0

  override fun getEventData(): WritableMap = if (GestureHandler.usesNativeOrVirtualDetector(actionType)) {
    createNativeEventData(dataBuilder!!, newState, oldState)
  } else {
    createEventData(dataBuilder!!, newState, oldState)
  }

  companion object {
    const val EVENT_NAME = "onGestureHandlerStateChange"
    const val REANIMATED_EVENT_NAME = "onGestureHandlerReanimatedStateChange"
    private const val TOUCH_EVENTS_POOL_SIZE = 7 // magic
    private val EVENTS_POOL = Pools.SynchronizedPool<RNGestureHandlerStateChangeEvent>(
      TOUCH_EVENTS_POOL_SIZE,
    )

    fun <T : GestureHandler> obtain(
      handler: T,
      newState: Int,
      oldState: Int,
      actionType: Int,
      dataBuilder: GestureHandlerEventDataBuilder<T>,
      eventHandlerType: EventHandlerType,
    ): RNGestureHandlerStateChangeEvent = (
      EVENTS_POOL.acquire()
        ?: RNGestureHandlerStateChangeEvent()
      ).apply {
      init(handler, newState, oldState, actionType, dataBuilder, eventHandlerType)
    }

    fun createEventData(dataBuilder: GestureHandlerEventDataBuilder<*>, newState: Int, oldState: Int): WritableMap =
      Arguments.createMap().apply {
        dataBuilder.buildEventData(this)
        putInt("handlerTag", dataBuilder.handlerTag)
        putInt("state", newState)
        putInt("oldState", oldState)
      }

    fun createNativeEventData(
      dataBuilder: GestureHandlerEventDataBuilder<*>,
      newState: Int,
      oldState: Int,
    ): WritableMap = Arguments.createMap().apply {
      putMap(
        "handlerData",
        Arguments.createMap().apply {
          dataBuilder.buildEventData(this)
        },
      )
      putInt("handlerTag", dataBuilder.handlerTag)
      putInt("state", newState)
      putInt("oldState", oldState)
    }
  }
}
