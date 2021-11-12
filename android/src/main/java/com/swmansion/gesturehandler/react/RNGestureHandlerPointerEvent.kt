package com.swmansion.gesturehandler.react

import androidx.core.util.Pools
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.events.Event
import com.facebook.react.uimanager.events.RCTEventEmitter
import com.swmansion.gesturehandler.GestureHandler

class RNGestureHandlerPointerEvent private constructor() : Event<RNGestureHandlerPointerEvent>() {
  private var extraData: WritableMap? = null
  private var coalescingKey: Short = 0
  private fun <T : GestureHandler<T>> init(handler: T) {
    super.init(handler.view!!.id)
    extraData = createEventData(handler)
    coalescingKey = handler.eventCoalescingKey
  }

  override fun onDispose() {
    extraData = null
    EVENTS_POOL.release(this)
  }

  override fun getEventName() = EVENT_NAME

  override fun canCoalesce() = true

  override fun getCoalescingKey() = coalescingKey

  override fun dispatch(rctEventEmitter: RCTEventEmitter) {
    rctEventEmitter.receiveEvent(viewTag, EVENT_NAME, extraData)
  }

  companion object {
    const val EVENT_UNDETERMINED = 0
    const val EVENT_POINTER_DOWN = 1
    const val EVENT_POINTER_MOVE = 2
    const val EVENT_POINTER_UP = 3
    const val EVENT_POINTER_CANCELLED = 4

    const val EVENT_NAME = "onGestureHandlerEvent"
    private const val TOUCH_EVENTS_POOL_SIZE = 7 // magic
    private val EVENTS_POOL = Pools.SynchronizedPool<RNGestureHandlerPointerEvent>(TOUCH_EVENTS_POOL_SIZE)

    fun <T : GestureHandler<T>> obtain(handler: T): RNGestureHandlerPointerEvent =
        (EVENTS_POOL.acquire() ?: RNGestureHandlerPointerEvent()).apply {
          init(handler)
        }

    fun <T: GestureHandler<T>> createEventData(handler: T,): WritableMap = Arguments.createMap().apply {
      putInt("handlerTag", handler.tag)
      putInt("state", handler.state)
      putInt("numberOfPointers", handler.trackedPointersCount)
      putInt("eventType", handler.pointerEventType)

      handler.pointerEventPayload?.let {
        putArray("pointerData", it)

        if (handler.isAwaiting && handler.state == GestureHandler.STATE_ACTIVE) {
          putInt("state", GestureHandler.STATE_BEGAN)
        }
      }
    }
  }
}
