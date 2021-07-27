package com.swmansion.gesturehandler.react

import androidx.core.util.Pools
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.events.Event
import com.facebook.react.uimanager.events.RCTEventEmitter
import com.swmansion.gesturehandler.GestureHandler

class RNGestureHandlerStateChangeEvent private constructor() : Event<RNGestureHandlerStateChangeEvent?>() {
  private var mExtraData: WritableMap? = null
  private fun init(
    handler: GestureHandler<*>,
    newState: Int,
    oldState: Int,
    dataExtractor: RNGestureHandlerEventDataExtractor<*>?
  ) {
    super.init(handler.view!!.id)
    mExtraData = Arguments.createMap()
    dataExtractor?.extractEventData(handler, mExtraData!!)
    mExtraData.putInt("handlerTag", handler.tag)
    mExtraData.putInt("state", newState)
    mExtraData.putInt("oldState", oldState)
  }

  override fun onDispose() {
    mExtraData = null
    EVENTS_POOL.release(this)
  }

  override fun getEventName(): String {
    return EVENT_NAME
  }

  override fun canCoalesce(): Boolean {
    // TODO: coalescing
    return false
  }

  override fun getCoalescingKey(): Short {
    // TODO: coalescing
    return 0
  }

  override fun dispatch(rctEventEmitter: RCTEventEmitter) {
    rctEventEmitter.receiveEvent(viewTag, EVENT_NAME, mExtraData)
  }

  companion object {
    const val EVENT_NAME = "onGestureHandlerStateChange"
    private const val TOUCH_EVENTS_POOL_SIZE = 7 // magic
    private val EVENTS_POOL = Pools.SynchronizedPool<RNGestureHandlerStateChangeEvent>(TOUCH_EVENTS_POOL_SIZE)
    fun obtain(
      handler: GestureHandler<*>,
      newState: Int,
      oldState: Int,
      dataExtractor: RNGestureHandlerEventDataExtractor<*>?
    ): RNGestureHandlerStateChangeEvent {
      var event = EVENTS_POOL.acquire()
      if (event == null) {
        event = RNGestureHandlerStateChangeEvent()
      }
      event.init(handler, newState, oldState, dataExtractor)
      return event
    }
  }
}