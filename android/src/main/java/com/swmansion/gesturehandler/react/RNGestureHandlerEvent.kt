package com.swmansion.gesturehandler.react

import androidx.core.util.Pools
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.events.Event
import com.facebook.react.uimanager.events.RCTEventEmitter
import com.swmansion.gesturehandler.GestureHandler

class RNGestureHandlerEvent private constructor() : Event<RNGestureHandlerEvent?>() {
  private var mExtraData: WritableMap? = null
  private var mCoalescingKey: Short = 0
  private fun init(
    handler: GestureHandler<*>,
    dataExtractor: RNGestureHandlerEventDataExtractor<*>?
  ) {
    super.init(handler.view!!.id)
    mExtraData = Arguments.createMap()
    dataExtractor?.extractEventData(handler, mExtraData!!)
    mExtraData.putInt("handlerTag", handler.tag)
    mExtraData.putInt("state", handler.state)
    mCoalescingKey = handler.eventCoalescingKey
  }

  override fun onDispose() {
    mExtraData = null
    EVENTS_POOL.release(this)
  }

  override fun getEventName(): String {
    return EVENT_NAME
  }

  override fun canCoalesce(): Boolean {
    return true
  }

  override fun getCoalescingKey(): Short {
    return mCoalescingKey
  }

  override fun dispatch(rctEventEmitter: RCTEventEmitter) {
    rctEventEmitter.receiveEvent(viewTag, EVENT_NAME, mExtraData)
  }

  companion object {
    const val EVENT_NAME = "onGestureHandlerEvent"
    private const val TOUCH_EVENTS_POOL_SIZE = 7 // magic
    private val EVENTS_POOL = Pools.SynchronizedPool<RNGestureHandlerEvent>(TOUCH_EVENTS_POOL_SIZE)
    fun obtain(
      handler: GestureHandler<*>,
      dataExtractor: RNGestureHandlerEventDataExtractor<*>?
    ): RNGestureHandlerEvent {
      var event = EVENTS_POOL.acquire()
      if (event == null) {
        event = RNGestureHandlerEvent()
      }
      event.init(handler, dataExtractor)
      return event
    }
  }
}