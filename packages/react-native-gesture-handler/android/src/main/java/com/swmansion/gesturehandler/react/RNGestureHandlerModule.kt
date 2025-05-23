package com.swmansion.gesturehandler.react

import android.util.Log
import android.view.MotionEvent
import com.facebook.react.ReactRootView
import com.facebook.react.bridge.JSApplicationIllegalArgumentException
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.WritableMap
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.events.Event
import com.facebook.soloader.SoLoader
import com.swmansion.common.GestureHandlerStateManager
import com.swmansion.gesturehandler.BuildConfig
import com.swmansion.gesturehandler.NativeRNGestureHandlerModuleSpec
import com.swmansion.gesturehandler.ReanimatedEventDispatcher
import com.swmansion.gesturehandler.core.FlingGestureHandler
import com.swmansion.gesturehandler.core.GestureHandler
import com.swmansion.gesturehandler.core.HoverGestureHandler
import com.swmansion.gesturehandler.core.LongPressGestureHandler
import com.swmansion.gesturehandler.core.ManualGestureHandler
import com.swmansion.gesturehandler.core.NativeViewGestureHandler
import com.swmansion.gesturehandler.core.OnTouchEventListener
import com.swmansion.gesturehandler.core.PanGestureHandler
import com.swmansion.gesturehandler.core.PinchGestureHandler
import com.swmansion.gesturehandler.core.RotationGestureHandler
import com.swmansion.gesturehandler.core.TapGestureHandler
import com.swmansion.gesturehandler.dispatchEvent

// NativeModule.onCatalystInstanceDestroy() was deprecated in favor of NativeModule.invalidate()
// ref: https://github.com/facebook/react-native/commit/18c8417290823e67e211bde241ae9dde27b72f17

// UIManagerModule.resolveRootTagFromReactTag() was deprecated and will be removed in the next RN release
// ref: https://github.com/facebook/react-native/commit/acbf9e18ea666b07c1224a324602a41d0a66985e
@Suppress("DEPRECATION")
@ReactModule(name = RNGestureHandlerModule.NAME)
class RNGestureHandlerModule(reactContext: ReactApplicationContext?) :
  NativeRNGestureHandlerModuleSpec(reactContext),
  GestureHandlerStateManager {

  private val eventListener = object : OnTouchEventListener {
    override fun <T : GestureHandler<T>> onHandlerUpdate(handler: T, event: MotionEvent) {
      this@RNGestureHandlerModule.onHandlerUpdate(handler)
    }

    override fun <T : GestureHandler<T>> onStateChange(handler: T, newState: Int, oldState: Int) {
      this@RNGestureHandlerModule.onStateChange(handler, newState, oldState)
    }

    override fun <T : GestureHandler<T>> onTouchEvent(handler: T) {
      this@RNGestureHandlerModule.onTouchEvent(handler)
    }
  }
  private val handlerFactories = arrayOf<GestureHandler.Factory<*>>(
    NativeViewGestureHandler.Factory(),
    TapGestureHandler.Factory(),
    LongPressGestureHandler.Factory(),
    PanGestureHandler.Factory(),
    PinchGestureHandler.Factory(),
    RotationGestureHandler.Factory(),
    FlingGestureHandler.Factory(),
    ManualGestureHandler.Factory(),
    HoverGestureHandler.Factory(),
  )
  val registry: RNGestureHandlerRegistry = RNGestureHandlerRegistry()
  private val interactionManager = RNGestureHandlerInteractionManager()
  private val roots: MutableList<RNGestureHandlerRootHelper> = ArrayList()
  private val reanimatedEventDispatcher = ReanimatedEventDispatcher()
  override fun getName() = NAME

  @Suppress("UNCHECKED_CAST")
  private fun <T : GestureHandler<T>> createGestureHandlerHelper(
    handlerName: String,
    handlerTag: Int,
    config: ReadableMap,
  ) {
    if (registry.getHandler(handlerTag) !== null) {
      throw IllegalStateException(
        "Handler with tag $handlerTag already exists. Please ensure that no Gesture instance is used across multiple GestureDetectors.",
      )
    }

    for (handlerFactory in handlerFactories as Array<GestureHandler.Factory<T>>) {
      if (handlerFactory.name == handlerName) {
        val handler = handlerFactory.create(reactApplicationContext).apply {
          tag = handlerTag
          setOnTouchEventListener(eventListener)
        }
        registry.registerHandler(handler)
        interactionManager.configureInteractions(handler, config)
        handlerFactory.setConfig(handler, config)
        return
      }
    }
    throw JSApplicationIllegalArgumentException("Invalid handler name $handlerName")
  }

  @ReactMethod
  override fun createGestureHandler(handlerName: String, handlerTagDouble: Double, config: ReadableMap) {
    val handlerTag = handlerTagDouble.toInt()

    createGestureHandlerHelper(handlerName, handlerTag, config)
  }

  @ReactMethod
  override fun attachGestureHandler(handlerTagDouble: Double, viewTagDouble: Double, actionTypeDouble: Double) {
    val handlerTag = handlerTagDouble.toInt()
    val viewTag = viewTagDouble.toInt()
    val actionType = actionTypeDouble.toInt()
    // We don't have to handle view flattening in any special way since handlers are stored as
    // a map: viewTag -> [handler]. If the view with attached handlers was to be flattened
    // then that viewTag simply wouldn't be visited when traversing the view hierarchy in the
    // Orchestrator effectively ignoring all handlers attached to flattened views.
    if (!registry.attachHandlerToView(handlerTag, viewTag, actionType)) {
      throw JSApplicationIllegalArgumentException("Handler with tag $handlerTag does not exists")
    }
  }

  @Suppress("UNCHECKED_CAST")
  private fun <T : GestureHandler<T>> updateGestureHandlerHelper(handlerTag: Int, config: ReadableMap) {
    val handler = registry.getHandler(handlerTag) as T?
    if (handler != null) {
      val factory = findFactoryForHandler(handler)
      if (factory != null) {
        interactionManager.dropRelationsForHandlerWithTag(handlerTag)
        interactionManager.configureInteractions(handler, config)
        factory.setConfig(handler, config)
      }
    }
  }

  @ReactMethod
  override fun updateGestureHandler(handlerTagDouble: Double, config: ReadableMap) {
    val handlerTag = handlerTagDouble.toInt()

    updateGestureHandlerHelper(handlerTag, config)
  }

  @ReactMethod
  override fun dropGestureHandler(handlerTagDouble: Double) {
    val handlerTag = handlerTagDouble.toInt()
    interactionManager.dropRelationsForHandlerWithTag(handlerTag)
    registry.dropHandler(handlerTag)
  }

  @ReactMethod
  override fun handleSetJSResponder(viewTagDouble: Double, blockNativeResponder: Boolean) {
    val viewTag = viewTagDouble.toInt()
    val rootView = findRootHelperForViewAncestor(viewTag)
    rootView?.handleSetJSResponder(viewTag, blockNativeResponder)
  }

  @ReactMethod
  override fun handleClearJSResponder() {
  }

  @ReactMethod
  override fun flushOperations() {
  }

  override fun setGestureHandlerState(handlerTag: Int, newState: Int) {
    registry.getHandler(handlerTag)?.let { handler ->
      when (newState) {
        GestureHandler.STATE_ACTIVE -> handler.activate(force = true)
        GestureHandler.STATE_BEGAN -> handler.begin()
        GestureHandler.STATE_END -> handler.end()
        GestureHandler.STATE_FAILED -> handler.fail()
        GestureHandler.STATE_CANCELLED -> handler.cancel()
      }
    }
  }

  @ReactMethod(isBlockingSynchronousMethod = true)
  override fun install(): Boolean {
    reactApplicationContext.runOnJSQueueThread {
      try {
        SoLoader.loadLibrary("gesturehandler")
        val jsContext = reactApplicationContext.javaScriptContextHolder!!
        decorateRuntime(jsContext.get())
      } catch (exception: Exception) {
        Log.w("[RNGestureHandler]", "Could not install JSI bindings.")
      }
    }

    return true
  }

  private external fun decorateRuntime(jsiPtr: Long)

  override fun getConstants(): Map<String, Any> = mapOf(
    "State" to mapOf(
      "UNDETERMINED" to GestureHandler.STATE_UNDETERMINED,
      "BEGAN" to GestureHandler.STATE_BEGAN,
      "ACTIVE" to GestureHandler.STATE_ACTIVE,
      "CANCELLED" to GestureHandler.STATE_CANCELLED,
      "FAILED" to GestureHandler.STATE_FAILED,
      "END" to GestureHandler.STATE_END,
    ),
    "Direction" to mapOf(
      "RIGHT" to GestureHandler.DIRECTION_RIGHT,
      "LEFT" to GestureHandler.DIRECTION_LEFT,
      "UP" to GestureHandler.DIRECTION_UP,
      "DOWN" to GestureHandler.DIRECTION_DOWN,
    ),
  )

  override fun invalidate() {
    registry.dropAllHandlers()
    interactionManager.reset()
    synchronized(roots) {
      while (roots.isNotEmpty()) {
        val sizeBefore: Int = roots.size
        val root: RNGestureHandlerRootHelper = roots[0]
        root.tearDown()
        if (roots.size >= sizeBefore) {
          throw IllegalStateException("Expected root helper to get unregistered while tearing down")
        }
      }
    }
    super.invalidate()
  }

  fun registerRootHelper(root: RNGestureHandlerRootHelper) {
    synchronized(roots) {
      if (root in roots) {
        throw IllegalStateException("Root helper$root already registered")
      }
      roots.add(root)
    }
  }

  fun unregisterRootHelper(root: RNGestureHandlerRootHelper) {
    synchronized(roots) { roots.remove(root) }
  }

  private fun findRootHelperForViewAncestor(viewTag: Int): RNGestureHandlerRootHelper? {
    // TODO: remove resolveRootTagFromReactTag as it's deprecated and unavailable on FabricUIManager
    val uiManager = reactApplicationContext.UIManager
    val rootViewTag = uiManager.resolveRootTagFromReactTag(viewTag)
    if (rootViewTag < 1) {
      return null
    }
    synchronized(roots) {
      return roots.firstOrNull {
        it.rootView is ReactRootView && it.rootView.rootViewTag == rootViewTag
      }
    }
  }

  @Suppress("UNCHECKED_CAST")
  private fun <T : GestureHandler<T>> findFactoryForHandler(handler: GestureHandler<T>): GestureHandler.Factory<T>? =
    handlerFactories.firstOrNull { it.type == handler.javaClass } as GestureHandler.Factory<T>?

  private fun <T : GestureHandler<T>> onHandlerUpdate(handler: T) {
    // triggers onUpdate and onChange callbacks on the JS side

    if (handler.tag < 0) {
      // root containers use negative tags, we don't need to dispatch events for them to the JS
      return
    }
    if (handler.state == GestureHandler.STATE_ACTIVE) {
      val handlerFactory = findFactoryForHandler(handler) ?: return

      if (handler.actionType == GestureHandler.ACTION_TYPE_REANIMATED_WORKLET) {
        // Reanimated worklet
        val event = RNGestureHandlerEvent.obtain(
          handler,
          handlerFactory.createEventBuilder(handler),
        )
        sendEventForReanimated(event)
      } else if (handler.actionType == GestureHandler.ACTION_TYPE_NATIVE_ANIMATED_EVENT) {
        // Animated with useNativeDriver: true
        val event = RNGestureHandlerEvent.obtain(
          handler,
          handlerFactory.createEventBuilder(handler),
          true,
        )
        sendEventForNativeAnimatedEvent(event)
      } else if (handler.actionType == GestureHandler.ACTION_TYPE_JS_FUNCTION_OLD_API) {
        // JS function, Animated.event with useNativeDriver: false using old API
        if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
          val data = RNGestureHandlerEvent.createEventData(
            handlerFactory.createEventBuilder(handler),
          )
          sendEventForDeviceEvent(RNGestureHandlerEvent.EVENT_NAME, data)
        } else {
          val event = RNGestureHandlerEvent.obtain(
            handler,
            handlerFactory.createEventBuilder(handler),
          )
          sendEventForDirectEvent(event)
        }
      } else if (handler.actionType == GestureHandler.ACTION_TYPE_JS_FUNCTION_NEW_API) {
        // JS function, Animated.event with useNativeDriver: false using new API
        val data = RNGestureHandlerEvent.createEventData(handlerFactory.createEventBuilder(handler))
        sendEventForDeviceEvent(RNGestureHandlerEvent.EVENT_NAME, data)
      }
    }
  }

  private fun <T : GestureHandler<T>> onStateChange(handler: T, newState: Int, oldState: Int) {
    // triggers onBegin, onStart, onEnd, onFinalize callbacks on the JS side

    if (handler.tag < 0) {
      // root containers use negative tags, we don't need to dispatch events for them to the JS
      return
    }
    val handlerFactory = findFactoryForHandler(handler) ?: return

    if (handler.actionType == GestureHandler.ACTION_TYPE_REANIMATED_WORKLET) {
      // Reanimated worklet
      val event = RNGestureHandlerStateChangeEvent.obtain(
        handler,
        newState,
        oldState,
        handlerFactory.createEventBuilder(handler),
      )
      sendEventForReanimated(event)
    } else if (handler.actionType == GestureHandler.ACTION_TYPE_NATIVE_ANIMATED_EVENT ||
      handler.actionType == GestureHandler.ACTION_TYPE_JS_FUNCTION_OLD_API
    ) {
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
          handlerFactory.createEventBuilder(handler),
        )
        sendEventForDirectEvent(event)
      }
    } else if (handler.actionType == GestureHandler.ACTION_TYPE_JS_FUNCTION_NEW_API) {
      // JS function or Animated.event with useNativeDriver: false with new API
      val data = RNGestureHandlerStateChangeEvent.createEventData(
        handlerFactory.createEventBuilder(handler),
        newState,
        oldState,
      )
      sendEventForDeviceEvent(RNGestureHandlerStateChangeEvent.EVENT_NAME, data)
    }
  }

  private fun <T : GestureHandler<T>> onTouchEvent(handler: T) {
    // triggers onTouchesDown, onTouchesMove, onTouchesUp, onTouchesCancelled callbacks on the JS side

    if (handler.tag < 0) {
      // root containers use negative tags, we don't need to dispatch events for them to the JS
      return
    }
    if (handler.state == GestureHandler.STATE_BEGAN ||
      handler.state == GestureHandler.STATE_ACTIVE ||
      handler.state == GestureHandler.STATE_UNDETERMINED ||
      handler.view != null
    ) {
      if (handler.actionType == GestureHandler.ACTION_TYPE_REANIMATED_WORKLET) {
        // Reanimated worklet
        val event = RNGestureHandlerTouchEvent.obtain(handler)
        sendEventForReanimated(event)
      } else if (handler.actionType == GestureHandler.ACTION_TYPE_JS_FUNCTION_NEW_API) {
        // JS function, Animated.event with useNativeDriver: false with new API
        val data = RNGestureHandlerTouchEvent.createEventData(handler)
        sendEventForDeviceEvent(RNGestureHandlerEvent.EVENT_NAME, data)
      }
    }
  }

  private fun <T : Event<T>> sendEventForReanimated(event: T) {
    // Delivers the event to Reanimated.
    if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
      // Send event directly to Reanimated
      reanimatedEventDispatcher.sendEvent(event, reactApplicationContext)
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

  companion object {
    const val NAME = "RNGestureHandlerModule"
  }
}
