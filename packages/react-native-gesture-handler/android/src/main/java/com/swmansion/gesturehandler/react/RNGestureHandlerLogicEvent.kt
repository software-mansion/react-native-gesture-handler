// 1. RCTEventEmitter was deprecated in favor of RCTModernEventEmitter interface
// 2. Event#init() with only viewTag was deprecated in favor of two arg c-tor
// 3. Event#receiveEvent() with 3 args was deprecated in favor of 4 args version
// ref: https://github.com/facebook/react-native/commit/2fbbdbb2ce897e8da3f471b08b93f167d566db1d
@file:Suppress("DEPRECATION")

package com.swmansion.gesturehandler.react

import androidx.core.util.Pools
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.uimanager.events.Event
import com.swmansion.gesturehandler.core.GestureHandler
import com.swmansion.gesturehandler.react.eventbuilders.GestureHandlerEventDataBuilder

class RNGestureHandlerLogicEvent private constructor() : Event<RNGestureHandlerLogicEvent>() {
  private var dataBuilder: GestureHandlerEventDataBuilder<*>? = null
  private var coalescingKey: Short = 0
  private var actionType: Int = GestureHandler.ACTION_TYPE_LOGIC_DETECTOR
  private var childTag: Int? = null

  private fun <T : GestureHandler> init(handler: T, actionType: Int, dataBuilder: GestureHandlerEventDataBuilder<T>) {
    val view = handler.parentView!!

    super.init(UIManagerHelper.getSurfaceId(view), view.id)

    this.dataBuilder = dataBuilder
    coalescingKey = handler.eventCoalescingKey
    this.actionType = actionType

    this.childTag = handler.view!!.id
  }

  override fun onDispose() {
    dataBuilder = null
    EVENTS_POOL.release(this)
  }

  override fun getEventName() = EVENT_NAME

  override fun canCoalesce() = true

  override fun getCoalescingKey() = coalescingKey

  override fun getEventData(): WritableMap = createNativeEventData(dataBuilder!!, childTag)

  companion object {
    const val EVENT_NAME = "onGestureHandlerLogicEvent"
    private const val TOUCH_EVENTS_POOL_SIZE = 7 // magic
    private val EVENTS_POOL = Pools.SynchronizedPool<RNGestureHandlerLogicEvent>(TOUCH_EVENTS_POOL_SIZE)

    fun <T : GestureHandler> obtain(
      handler: T,
      actionType: Int,
      dataBuilder: GestureHandlerEventDataBuilder<T>,
    ): RNGestureHandlerLogicEvent = (EVENTS_POOL.acquire() ?: RNGestureHandlerLogicEvent()).apply {
      init(handler, actionType, dataBuilder)
    }

    fun createNativeEventData(dataBuilder: GestureHandlerEventDataBuilder<*>, childTag: Int?): WritableMap =
      Arguments.createMap().apply {
        putMap(
          "handlerData",
          Arguments.createMap().apply {
            dataBuilder.buildEventData(this)
          },
        )
        putInt("handlerTag", dataBuilder.handlerTag)
        putInt("state", dataBuilder.state)
        if (childTag != null) {
          putInt("childTag", childTag)
        }
      }
  }
}
