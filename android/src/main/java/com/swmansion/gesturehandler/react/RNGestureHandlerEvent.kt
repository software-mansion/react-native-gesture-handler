package com.swmansion.gesturehandler.react

import androidx.core.util.Pools
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.events.Event
import com.facebook.react.uimanager.events.RCTEventEmitter
import com.swmansion.gesturehandler.GestureHandler

class RNGestureHandlerEvent private constructor() : Event<RNGestureHandlerEvent>() {
  private var mExtraData: WritableMap? = null
  private var mCoalescingKey: Short = 0
  private fun <T : GestureHandler<T>> init(
    handler: T,
    dataExtractor: RNGestureHandlerEventDataExtractor<T>?,
  ) {
    super.init(handler.view!!.id)
    mExtraData = Arguments.createMap().apply {
      dataExtractor?.extractEventData(handler, this)
      putInt("handlerTag", handler.tag)
      putInt("state", handler.state)
    }
    mCoalescingKey = handler.eventCoalescingKey
  }

  override fun onDispose() {
    mExtraData = null
    EVENTS_POOL.release(this)
  }

  override fun getEventName() = EVENT_NAME

  override fun canCoalesce() = true

  override fun getCoalescingKey(): Short = mCoalescingKey

  override fun dispatch(rctEventEmitter: RCTEventEmitter) {
    rctEventEmitter.receiveEvent(viewTag, EVENT_NAME, mExtraData)
  }

  companion object {
    const val EVENT_NAME = "onGestureHandlerEvent"
    private const val TOUCH_EVENTS_POOL_SIZE = 7 // magic
    private val EVENTS_POOL = Pools.SynchronizedPool<RNGestureHandlerEvent>(TOUCH_EVENTS_POOL_SIZE)
    fun <T : GestureHandler<T>> obtain(
      handler: T,
      dataExtractor: RNGestureHandlerEventDataExtractor<T>?,
    ): RNGestureHandlerEvent =
      (EVENTS_POOL.acquire() ?: RNGestureHandlerEvent())
        .apply { init(handler, dataExtractor) }
  }
}