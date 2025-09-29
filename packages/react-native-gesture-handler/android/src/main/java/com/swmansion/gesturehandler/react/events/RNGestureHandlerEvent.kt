// 1. RCTEventEmitter was deprecated in favor of RCTModernEventEmitter interface
// 2. Event#init() with only viewTag was deprecated in favor of two arg c-tor
// 3. Event#receiveEvent() with 3 args was deprecated in favor of 4 args version
// ref: https://github.com/facebook/react-native/commit/2fbbdbb2ce897e8da3f471b08b93f167d566db1d
@file:Suppress("DEPRECATION")

package com.swmansion.gesturehandler.react.events

import androidx.core.util.Pools
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.uimanager.events.Event
import com.swmansion.gesturehandler.core.GestureHandler
import com.swmansion.gesturehandler.react.events.eventbuilders.GestureHandlerEventDataBuilder

class RNGestureHandlerEvent private constructor() : Event<RNGestureHandlerEvent>() {
  private var dataBuilder: GestureHandlerEventDataBuilder<*>? = null
  private var coalescingKey: Short = 0
  private var actionType: Int = GestureHandler.ACTION_TYPE_NATIVE_ANIMATED_EVENT
  private lateinit var eventHandlerType: EventHandlerType

  private fun <T : GestureHandler> init(
    handler: T,
    actionType: Int,
    dataBuilder: GestureHandlerEventDataBuilder<T>,
    eventHandlerType: EventHandlerType,
  ) {
    val view = if (GestureHandler.usesNativeOrLogicDetector(handler.actionType)) {
      handler.viewForEvents
    } else {
      handler.view!!
    }

    super.init(UIManagerHelper.getSurfaceId(view), view.id)

    this.actionType = actionType
    this.dataBuilder = dataBuilder
    this.eventHandlerType = eventHandlerType
    coalescingKey = handler.eventCoalescingKey
  }

  override fun onDispose() {
    dataBuilder = null
    EVENTS_POOL.release(this)
  }

  override fun getEventName() = if (GestureHandler.usesNativeOrLogicDetector(actionType)) {
    if (eventHandlerType == EventHandlerType.ForAnimated) {
      NATIVE_DETECTOR_ANIMATED_EVENT_NAME
    } else if (eventHandlerType == EventHandlerType.ForReanimated) {
      REANIMATED_EVENT_NAME
    } else {
      EVENT_NAME
    }
  } else if (eventHandlerType == EventHandlerType.ForAnimated) {
    NATIVE_ANIMATED_EVENT_NAME
  } else {
    EVENT_NAME
  }

  // Unfortunately getCoalescingKey is not considered when sending event to C++, therefore we have to disable coalescing in v3
  override fun canCoalesce() = !GestureHandler.usesNativeOrLogicDetector(actionType)

  override fun getCoalescingKey() = coalescingKey

  override fun getEventData(): WritableMap = if (GestureHandler.usesNativeOrLogicDetector(actionType)) {
    createNativeEventData(dataBuilder!!)
  } else {
    createEventData(dataBuilder!!)
  }

  companion object {
    const val EVENT_NAME = "onGestureHandlerEvent"
    const val REANIMATED_EVENT_NAME = "onGestureHandlerReanimatedEvent"

    // On the new architecture, native animated expects event names prefixed with `top` instead of `on`,
    // since we know when the native animated node is the target of the event we can use the different
    // event name where appropriate.
    // TODO: This is a workaround not as solution, but doing this properly would require a total overhaul of
    // how GH sends events (which needs to be done, but maybe wait until the RN's apis stop changing)
    const val NATIVE_ANIMATED_EVENT_NAME = "topGestureHandlerEvent"
    const val NATIVE_DETECTOR_ANIMATED_EVENT_NAME = "topGestureHandlerAnimatedEvent"
    private const val TOUCH_EVENTS_POOL_SIZE = 7 // magic
    private val EVENTS_POOL = Pools.SynchronizedPool<RNGestureHandlerEvent>(TOUCH_EVENTS_POOL_SIZE)

    fun <T : GestureHandler> obtain(
      handler: T,
      actionType: Int,
      dataBuilder: GestureHandlerEventDataBuilder<T>,
      eventHandlerType: EventHandlerType,
    ): RNGestureHandlerEvent = (EVENTS_POOL.acquire() ?: RNGestureHandlerEvent()).apply {
      init(handler, actionType, dataBuilder, eventHandlerType)
    }

    fun createEventData(dataBuilder: GestureHandlerEventDataBuilder<*>): WritableMap = Arguments.createMap().apply {
      dataBuilder.buildEventData(this)
      putInt("handlerTag", dataBuilder.handlerTag)
      putInt("state", dataBuilder.state)
    }

    fun createNativeEventData(dataBuilder: GestureHandlerEventDataBuilder<*>): WritableMap =
      Arguments.createMap().apply {
        putMap(
          "handlerData",
          Arguments.createMap().apply {
            dataBuilder.buildEventData(this)
          },
        )
        putInt("handlerTag", dataBuilder.handlerTag)
        putInt("state", dataBuilder.state)
      }
  }
}
