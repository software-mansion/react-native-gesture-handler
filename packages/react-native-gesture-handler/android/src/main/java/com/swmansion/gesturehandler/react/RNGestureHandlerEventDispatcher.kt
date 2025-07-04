package com.swmansion.gesturehandler.react

import android.view.MotionEvent
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.WritableMap
import com.facebook.react.uimanager.events.Event
import com.swmansion.gesturehandler.BuildConfig
import com.swmansion.gesturehandler.ReanimatedProxy
import com.swmansion.gesturehandler.core.GestureHandler
import com.swmansion.gesturehandler.core.OnTouchEventListener
import com.swmansion.gesturehandler.dispatchEvent

class RNGestureHandlerEventDispatcher(private val reactApplicationContext: ReactApplicationContext) :
  OnTouchEventListener {
  private val reanimatedProxy = ReanimatedProxy()

  override fun <T : GestureHandler> onHandlerUpdate(handler: T, event: MotionEvent) {
    this.dispatchHandlerUpdateEvent(handler)
  }

  override fun <T : GestureHandler> onStateChange(handler: T, newState: Int, oldState: Int) {
    this.dispatchStateChangeEvent(handler, newState, oldState)
  }

  override fun <T : GestureHandler> onTouchEvent(handler: T) {
    this.dispatchTouchEvent(handler)
  }

  private fun <T : GestureHandler> dispatchHandlerUpdateEvent(handler: T) {
    // triggers onUpdate and onChange callbacks on the JS side

    // root containers use negative tags, we don't need to dispatch events for them to the JS
    if (handler.tag < 0 || handler.state != GestureHandler.STATE_ACTIVE) {
      return
    }

    val handlerFactory = RNGestureHandlerFactoryUtil.findFactoryForHandler<GestureHandler>(handler) ?: return
    when (handler.actionType) {
      GestureHandler.ACTION_TYPE_REANIMATED_WORKLET -> {
        // Reanimated worklet
        val event = RNGestureHandlerEvent.obtain(
          handler,
          handler.actionType,
          handlerFactory.createEventBuilder(handler),
        )
        sendEventForReanimated(event)
      }
      GestureHandler.ACTION_TYPE_NATIVE_ANIMATED_EVENT -> {
        // Animated with useNativeDriver: true
        val event = RNGestureHandlerEvent.obtain(
          handler,
          handler.actionType,
          handlerFactory.createEventBuilder(handler),
          true,
        )
        sendEventForNativeAnimatedEvent(event)
      }
      GestureHandler.ACTION_TYPE_JS_FUNCTION_OLD_API -> {
        // JS function, Animated.event with useNativeDriver: false using old API
        if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
          val data = RNGestureHandlerEvent.createEventData(
            handlerFactory.createEventBuilder(handler),
          )
          sendEventForDeviceEvent(RNGestureHandlerEvent.EVENT_NAME, data)
        } else {
          val event = RNGestureHandlerEvent.obtain(
            handler,
            handler.actionType,
            handlerFactory.createEventBuilder(handler),
          )
          sendEventForDirectEvent(event)
        }
      }
      GestureHandler.ACTION_TYPE_JS_FUNCTION_NEW_API -> {
        // JS function, Animated.event with useNativeDriver: false using new API
        val data =
          RNGestureHandlerEvent.createEventData(handlerFactory.createEventBuilder(handler))
        sendEventForDeviceEvent(RNGestureHandlerEvent.EVENT_NAME, data)
      }
      GestureHandler.ACTION_TYPE_NATIVE_DETECTOR, GestureHandler.ACTION_TYPE_NATIVE_DETECTOR_ANIMATED_EVENT -> {
        val view = handler.view
        if (view is RNGestureHandlerDetectorView) {
          val event = RNGestureHandlerEvent.obtain(
            handler,
            handler.actionType,
            handlerFactory.createEventBuilder(handler),
            useTopPrefixedName = handler.actionType == GestureHandler.ACTION_TYPE_NATIVE_DETECTOR_ANIMATED_EVENT,
          )
          view.dispatchEvent(event)
        }
      }
    }
  }

  private fun <T : GestureHandler> dispatchStateChangeEvent(handler: T, newState: Int, oldState: Int) {
    // triggers onBegin, onStart, onEnd, onFinalize callbacks on the JS side

    if (handler.tag < 0) {
      // root containers use negative tags, we don't need to dispatch events for them to the JS
      return
    }
    val handlerFactory = RNGestureHandlerFactoryUtil.findFactoryForHandler<GestureHandler>(handler) ?: return

    when (handler.actionType) {
      GestureHandler.ACTION_TYPE_REANIMATED_WORKLET -> {
        // Reanimated worklet
        val event = RNGestureHandlerStateChangeEvent.obtain(
          handler,
          newState,
          oldState,
          handler.actionType,
          handlerFactory.createEventBuilder(handler),
        )
        sendEventForReanimated(event)
      }

      GestureHandler.ACTION_TYPE_NATIVE_ANIMATED_EVENT, GestureHandler.ACTION_TYPE_JS_FUNCTION_OLD_API -> {
        // JS function or Animated.event with useNativeDriver: false with old API
        if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
          val data = RNGestureHandlerStateChangeEvent.createEventData(
            handlerFactory.createEventBuilder(handler),
            newState,
            oldState,
          )
          sendEventForDeviceEvent(RNGestureHandlerStateChangeEvent.EVENT_NAME, data)
        } else {
          val event = RNGestureHandlerStateChangeEvent.obtain(
            handler,
            newState,
            oldState,
            handler.actionType,
            handlerFactory.createEventBuilder(handler),
          )
          sendEventForDirectEvent(event)
        }
      }

      GestureHandler.ACTION_TYPE_JS_FUNCTION_NEW_API -> {
        // JS function or Animated.event with useNativeDriver: false with new API
        val data = RNGestureHandlerStateChangeEvent.createEventData(
          handlerFactory.createEventBuilder(handler),
          newState,
          oldState,
        )
        sendEventForDeviceEvent(RNGestureHandlerStateChangeEvent.EVENT_NAME, data)
      }

      GestureHandler.ACTION_TYPE_NATIVE_DETECTOR, GestureHandler.ACTION_TYPE_NATIVE_DETECTOR_ANIMATED_EVENT -> {
        val view = handler.view
        if (view is RNGestureHandlerDetectorView) {
          val event = RNGestureHandlerStateChangeEvent.obtain(
            handler,
            newState,
            oldState,
            handler.actionType,
            handlerFactory.createEventBuilder(handler),
          )
          view.dispatchEvent(event)
        }
      }
    }
  }

  private fun <T : GestureHandler> dispatchTouchEvent(handler: T) {
    // triggers onTouchesDown, onTouchesMove, onTouchesUp, onTouchesCancelled callbacks on the JS side

    if (handler.tag < 0) {
      // root containers use negative tags, we don't need to dispatch events for them to the JS
      return
    }

    if (handler.state != GestureHandler.STATE_BEGAN &&
      handler.state != GestureHandler.STATE_ACTIVE &&
      handler.state != GestureHandler.STATE_UNDETERMINED &&
      handler.view == null
    ) {
      return
    }

    when (handler.actionType) {
      GestureHandler.ACTION_TYPE_REANIMATED_WORKLET -> {
        // Reanimated worklet
        val event = RNGestureHandlerTouchEvent.obtain(handler, handler.actionType)
        sendEventForReanimated(event)
      }
      GestureHandler.ACTION_TYPE_JS_FUNCTION_NEW_API -> {
        // JS function, Animated.event with useNativeDriver: false with new API
        val data = RNGestureHandlerTouchEvent.createEventData(handler)
        sendEventForDeviceEvent(RNGestureHandlerEvent.EVENT_NAME, data)
      }
      GestureHandler.ACTION_TYPE_NATIVE_DETECTOR, GestureHandler.ACTION_TYPE_NATIVE_DETECTOR_ANIMATED_EVENT -> {
        val view = handler.view
        if (view is RNGestureHandlerDetectorView) {
          val event = RNGestureHandlerTouchEvent.obtain(handler, handler.actionType)
          view.dispatchEvent(event)
        }
      }
    }
  }

  private fun <T : Event<T>> sendEventForReanimated(event: T) {
    // Delivers the event to Reanimated.
    if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
      // Send event directly to Reanimated
      reanimatedProxy.sendEvent(event, reactApplicationContext)
    } else {
      // In the old architecture, Reanimated subscribes for specific direct events.
      sendEventForDirectEvent(event)
    }
  }

  private fun sendEventForNativeAnimatedEvent(event: RNGestureHandlerEvent) {
    // Delivers the event to NativeAnimatedModule.
    // TODO: send event directly to NativeAnimated[Turbo]Module
    // ReactContext.dispatchEvent is an extension function, depending on the architecture it will
    // dispatch event using UIManagerModule or FabricUIManager.
    reactApplicationContext.dispatchEvent(event)
  }

  private fun <T : Event<T>> sendEventForDirectEvent(event: T) {
    // Delivers the event to JS as a direct event. This method is called only on Paper.
    reactApplicationContext.dispatchEvent(event)
  }

  private fun sendEventForDeviceEvent(eventName: String, data: WritableMap) {
    // Delivers the event to JS as a device event.
    reactApplicationContext.deviceEventEmitter.emit(eventName, data)
  }
}
