package com.swmansion.gesturehandler.react.events

import androidx.core.util.Pools
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.uimanager.events.Event
import com.swmansion.gesturehandler.core.GestureHandler

class RNGestureHandlerTouchEvent private constructor() : Event<RNGestureHandlerTouchEvent>() {
  private var extraData: WritableMap? = null
  private var coalescingKey: Short = 0
  private var actionType = GestureHandler.ACTION_TYPE_JS_FUNCTION_NEW_API
  private lateinit var eventTarget: EventTarget

  private fun <T : GestureHandler> init(handler: T, actionType: Int, eventTarget: EventTarget) {
    val view = if (handler.actionType == GestureHandler.ACTION_TYPE_NATIVE_DETECTOR) {
      handler.viewForEvents!!
    } else {
      handler.view!!
    }

    super.init(UIManagerHelper.getSurfaceId(view), view.id)

    extraData = createEventData(handler)
    coalescingKey = handler.eventCoalescingKey
    this.actionType = actionType
    this.eventTarget = eventTarget
  }

  override fun onDispose() {
    extraData = null
    EVENTS_POOL.release(this)
  }

  override fun getEventName() = if (actionType == GestureHandler.ACTION_TYPE_NATIVE_DETECTOR) {
    if (eventTarget == EventTarget.Reanimated) REANIMATED_EVENT_NAME else NATIVE_EVENT_NAME
  } else {
    EVENT_NAME
  }

  override fun canCoalesce() = true

  override fun getCoalescingKey() = coalescingKey
  override fun getEventData(): WritableMap? = extraData

  companion object {
    const val EVENT_UNDETERMINED = 0
    const val EVENT_TOUCH_DOWN = 1
    const val EVENT_TOUCH_MOVE = 2
    const val EVENT_TOUCH_UP = 3
    const val EVENT_TOUCH_CANCELLED = 4

    const val EVENT_NAME = "onGestureHandlerEvent"
    const val REANIMATED_EVENT_NAME = "onGestureHandlerReanimatedTouchEvent"
    const val NATIVE_EVENT_NAME = "onGestureHandlerTouchEvent"
    private const val TOUCH_EVENTS_POOL_SIZE = 7 // magic
    private val EVENTS_POOL = Pools.SynchronizedPool<RNGestureHandlerTouchEvent>(
      TOUCH_EVENTS_POOL_SIZE,
    )

    fun <T : GestureHandler> obtain(handler: T, actionType: Int, eventTarget: EventTarget): RNGestureHandlerTouchEvent =
      (EVENTS_POOL.acquire() ?: RNGestureHandlerTouchEvent()).apply {
        init(handler, actionType, eventTarget)
      }

    fun <T : GestureHandler> createEventData(handler: T): WritableMap = Arguments.createMap().apply {
      putInt("handlerTag", handler.tag)
      putInt("state", handler.state)
      putInt("numberOfTouches", handler.trackedPointersCount)
      putInt("eventType", handler.touchEventType)
      putInt("pointerType", handler.pointerType)

      handler.consumeChangedTouchesPayload()?.let {
        putArray("changedTouches", it)
      }

      handler.consumeAllTouchesPayload()?.let {
        putArray("allTouches", it)
      }

      if (handler.isAwaiting && handler.state == GestureHandler.STATE_ACTIVE) {
        putInt("state", GestureHandler.STATE_BEGAN)
      }
    }
  }
}
