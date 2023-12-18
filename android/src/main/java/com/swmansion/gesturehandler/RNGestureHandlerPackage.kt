package com.swmansion.gesturehandler

import com.facebook.react.TurboReactPackage
import com.facebook.react.ViewManagerOnDemandReactPackage
import com.facebook.react.bridge.ModuleSpec
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider
import com.facebook.react.turbomodule.core.interfaces.TurboModule
import com.facebook.react.uimanager.ReactShadowNode
import com.facebook.react.uimanager.ViewManager
import com.swmansion.gesturehandler.react.RNGestureHandlerButtonViewManager
import com.swmansion.gesturehandler.react.RNGestureHandlerModule
import com.swmansion.gesturehandler.react.RNGestureHandlerRootViewManager

class RNGestureHandlerPackage : TurboReactPackage(), ViewManagerOnDemandReactPackage {
  private var _viewManagers: Map<String, ModuleSpec>? = null
  private val viewManagers: Map<String, ModuleSpec>
    get() {
      if (_viewManagers == null) {
        _viewManagers = mutableMapOf(
          RNGestureHandlerRootViewManager.REACT_CLASS to ModuleSpec.viewManagerSpec {
            RNGestureHandlerRootViewManager()
          },
          RNGestureHandlerButtonViewManager.REACT_CLASS to ModuleSpec.viewManagerSpec {
            RNGestureHandlerButtonViewManager()
          }
        )
      }

      return _viewManagers!!
    }

  override fun createViewManagers(reactContext: ReactApplicationContext) =
    listOf<ViewManager<*, *>>(
      RNGestureHandlerRootViewManager(),
      RNGestureHandlerButtonViewManager()
    )

  override fun getViewManagerNames(reactContext: ReactApplicationContext?) =
    viewManagers.keys.toList()

  override fun getViewManagers(reactContext: ReactApplicationContext?): MutableList<ModuleSpec> =
    viewManagers.values.toMutableList()

  override fun createViewManager(
    reactContext: ReactApplicationContext?,
    viewManagerName: String?
  ): ViewManager<*, out ReactShadowNode<*>>? {
    return viewManagers[viewManagerName]?.provider?.get() as? ViewManager<*, *>
  }

  override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? {
    return if (name == RNGestureHandlerModule.MODULE_NAME) {
      RNGestureHandlerModule(reactContext)
    } else {
      null
    }
  }

  override fun getReactModuleInfoProvider(): ReactModuleInfoProvider {
    try {
      val reactModuleInfoProviderClass =
        Class.forName("com.swmansion.gesturehandler.RNGestureHandlerPackage$\$ReactModuleInfoProvider")
      return reactModuleInfoProviderClass.newInstance() as ReactModuleInfoProvider
    } catch (e: ClassNotFoundException) {
      return ReactModuleInfoProvider {
        val reactModule: ReactModule = RNGestureHandlerModule::class.java.getAnnotation(ReactModule::class.java)!!

        mutableMapOf(
          RNGestureHandlerModule.MODULE_NAME to ReactModuleInfo(
            reactModule.name,
            RNGestureHandlerModule::class.java.name,
            reactModule.canOverrideExistingModule,
            reactModule.needsEagerInit,
            reactModule.hasConstants,
            reactModule.isCxxModule,
            TurboModule::class.java.isAssignableFrom(RNGestureHandlerModule::class.java)
          )
        )
      }
    } catch (e: InstantiationException) {
      throw RuntimeException("No ReactModuleInfoProvider for RNGestureHandlerPackage$\$ReactModuleInfoProvider", e)
    } catch (e: IllegalAccessException) {
      throw RuntimeException("No ReactModuleInfoProvider for RNGestureHandlerPackage$\$ReactModuleInfoProvider", e)
    }
  }
}
