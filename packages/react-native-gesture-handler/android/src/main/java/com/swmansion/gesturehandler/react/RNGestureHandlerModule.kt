package com.swmansion.gesturehandler.react

import com.facebook.jni.HybridData
import com.facebook.proguard.annotations.DoNotStrip
import com.facebook.react.ReactRootView
import com.facebook.react.bridge.JSApplicationIllegalArgumentException
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableMap
import com.facebook.react.bridge.UiThreadUtil
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.turbomodule.core.interfaces.BindingsInstallerHolder
import com.facebook.react.turbomodule.core.interfaces.TurboModuleWithJSIBindings
import com.facebook.soloader.SoLoader
import com.swmansion.gesturehandler.NativeRNGestureHandlerModuleSpec
import com.swmansion.gesturehandler.ReanimatedProxy
import com.swmansion.gesturehandler.core.GestureHandler

// UIManagerModule.resolveRootTagFromReactTag() was deprecated and will be removed in the next RN release
// ref: https://github.com/facebook/react-native/commit/acbf9e18ea666b07c1224a324602a41d0a66985e
@Suppress("DEPRECATION")
@ReactModule(name = RNGestureHandlerModule.NAME)
class RNGestureHandlerModule(reactContext: ReactApplicationContext?) :
  NativeRNGestureHandlerModuleSpec(reactContext),
  TurboModuleWithJSIBindings {

  private val moduleId = nextModuleId++
  private val eventDispatcher = RNGestureHandlerEventDispatcher(reactApplicationContext)
  private val interactionManager = RNGestureHandlerInteractionManager()
  private val roots: MutableList<RNGestureHandlerRootHelper> = ArrayList()

  @DoNotStrip
  @Suppress("unused")
  private var mHybridData: HybridData = initHybrid()
  private var uiRuntimeDecorated = false
  private val registry: RNGestureHandlerRegistry
    get() = registries[moduleId]!!

  init {
    registries[moduleId] = RNGestureHandlerRegistry()
  }

  override fun getName() = NAME

  private fun <T : GestureHandler> createGestureHandlerHelper(
    handlerName: String,
    handlerTag: Int,
    config: ReadableMap,
  ) {
    if (registry.getHandler(handlerTag) !== null) {
      throw IllegalStateException(
        "Handler with tag $handlerTag already exists. Please ensure that no Gesture instance is used across multiple GestureDetectors.",
      )
    }

    val handlerFactory = RNGestureHandlerFactoryUtil.findFactoryForName<T>(handlerName)
      ?: throw JSApplicationIllegalArgumentException("Invalid handler name $handlerName")

    val handler = handlerFactory.create(reactApplicationContext, handlerTag)
    handler.onTouchEventListener = eventDispatcher
    registry.registerHandler(handler)
    interactionManager.configureInteractions(handler, config)
    handlerFactory.setConfig(handler, config)
  }

  @ReactMethod
  override fun createGestureHandler(handlerName: String, handlerTagDouble: Double, config: ReadableMap): Boolean {
    if (ReanimatedProxy.REANIMATED_INSTALLED && !uiRuntimeDecorated) {
      uiRuntimeDecorated = decorateUIRuntime()
    }

    val handlerTag = handlerTagDouble.toInt()

    createGestureHandlerHelper<GestureHandler>(handlerName, handlerTag, config)

    return true
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

  private fun <T : GestureHandler> updateGestureHandlerHelper(handlerTag: Int, config: ReadableMap) {
    val handler = registry.getHandler(handlerTag) ?: return
    val factory = RNGestureHandlerFactoryUtil.findFactoryForHandler<GestureHandler>(handler) ?: return
    interactionManager.dropRelationsForHandlerWithTag(handlerTag)
    interactionManager.configureInteractions(handler, config)
    factory.setConfig(handler, config)
  }

  @ReactMethod
  override fun updateGestureHandler(handlerTagDouble: Double, config: ReadableMap) {
    val handlerTag = handlerTagDouble.toInt()

    updateGestureHandlerHelper<GestureHandler>(handlerTag, config)
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
  override fun handleClearJSResponder() = Unit

  @ReactMethod
  override fun flushOperations() = Unit

  @DoNotStrip
  @Suppress("unused")
  fun setGestureHandlerState(handlerTag: Int, newState: Int) {
    if (UiThreadUtil.isOnUiThread()) {
      setGestureStateSync(handlerTag, newState)
    } else {
      UiThreadUtil.runOnUiThread {
        setGestureStateSync(handlerTag, newState)
      }
    }
  }

  private fun setGestureStateSync(handlerTag: Int, newState: Int) {
    UiThreadUtil.assertOnUiThread()

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

  private external fun initHybrid(): HybridData
  private external fun getBindingsInstallerCxx(): BindingsInstallerHolder
  private external fun decorateUIRuntime(): Boolean
  private external fun invalidateNative(): Unit

  override fun getBindingsInstaller() = getBindingsInstallerCxx()

  override fun invalidate() {
    registry.dropAllHandlers()
    interactionManager.reset()
    synchronized(roots) {
      while (roots.isNotEmpty()) {
        val sizeBefore: Int = roots.size
        val root: RNGestureHandlerRootHelper = roots[0]
        root.tearDown()

        assert(roots.size < sizeBefore) {
          "Expected root helper to get unregistered while tearing down"
        }
      }
    }
    registries.remove(moduleId)
    invalidateNative()
    super.invalidate()
  }

  fun registerRootHelper(root: RNGestureHandlerRootHelper) {
    synchronized(roots) {
      assert(root !in roots) { "Root helper$root already registered" }
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

  companion object {
    const val NAME = "RNGestureHandlerModule"

    private var nextModuleId = 0
    val registries: MutableMap<Int, RNGestureHandlerRegistry> = mutableMapOf()

    init {
      SoLoader.loadLibrary("gesturehandler")
    }
  }
}
