package com.swmansion.gesturehandler.react

import androidx.core.util.Pools
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.uimanager.events.Event
import com.swmansion.gesturehandler.core.GestureHandler

class RNGestureHandlerLogicTouchEvent private constructor() : Event<RNGestureHandlerLogicTouchEvent>() {
  private var extraData: WritableMap? = null
  private var coalescingKey: Short = 0
  private var actionType = GestureHandler.ACTION_TYPE_LOGIC_DETECTOR

  private var childTag: Int? = null

  private fun <T : GestureHandler> init(handler: T, actionType: Int) {
    val view = handler.parentView!!

    super.init(UIManagerHelper.getSurfaceId(view), view.id)

    extraData = createEventData(handler, childTag)
    coalescingKey = handler.eventCoalescingKey
    this.actionType = actionType

    this.childTag = handler.view!!.id
  }

  override fun onDispose() {
    extraData = null
    EVENTS_POOL.release(this)
  }

  override fun getEventName() = NATIVE_EVENT_NAME

  override fun canCoalesce() = true

  override fun getCoalescingKey() = coalescingKey
  override fun getEventData(): WritableMap? = extraData

  companion object {
    const val NATIVE_EVENT_NAME = "onGestureHandlerTouchEvent"
    private const val TOUCH_EVENTS_POOL_SIZE = 7 // magic
    private val EVENTS_POOL = Pools.SynchronizedPool<RNGestureHandlerLogicTouchEvent>(
      TOUCH_EVENTS_POOL_SIZE,
    )

    fun <T : GestureHandler> obtain(handler: T, actionType: Int): RNGestureHandlerLogicTouchEvent =
      (EVENTS_POOL.acquire() ?: RNGestureHandlerLogicTouchEvent()).apply {
        init(handler, actionType)
      }

    fun <T : GestureHandler> createEventData(handler: T, childTag: Int?): WritableMap = Arguments.createMap().apply {
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

      if (childTag != null) {
        putInt("childTag", childTag)
      }
    }
  }
}
