package com.swmansion.gesturehandlerv2

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager
import com.swmansion.gesturehandlerv2.BuildConfig
import com.swmansion.gesturehandlerv2.react.RNGestureHandlerModule
import com.swmansion.gesturehandlerv2.react.RNGestureHandlerRootViewManager
import com.swmansion.gesturehandlerv2.react.RNGestureHandlerButtonViewManager

class RNGestureHandlerPackageV2 : ReactPackage {
  override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
    return listOf<NativeModule>(RNGestureHandlerModule(reactContext))
  }

  override fun createViewManagers(reactContext: ReactApplicationContext) =
    listOf<ViewManager<*, *>>(
      RNGestureHandlerRootViewManager(),
      RNGestureHandlerButtonViewManager())
}
