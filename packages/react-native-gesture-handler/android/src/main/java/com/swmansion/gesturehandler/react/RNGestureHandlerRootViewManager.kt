package com.swmansion.gesturehandler.react

import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.uimanager.annotations.ReactProp
import com.facebook.react.viewmanagers.RNGestureHandlerRootViewManagerDelegate
import com.facebook.react.viewmanagers.RNGestureHandlerRootViewManagerInterface
import com.swmansion.gesturehandler.react.events.RNGestureHandlerEvent
import com.swmansion.gesturehandler.react.events.RNGestureHandlerStateChangeEvent

/**
 * React native's view manager used for creating instances of []RNGestureHandlerRootView}. It
 * is being used by projects using react-native-navigation where for each screen new root view need
 * to be provided.
 */
@ReactModule(name = RNGestureHandlerRootViewManager.REACT_CLASS)
class RNGestureHandlerRootViewManager :
  ViewGroupManager<RNGestureHandlerRootView>(),
  RNGestureHandlerRootViewManagerInterface<RNGestureHandlerRootView> {
  private val mDelegate: ViewManagerDelegate<RNGestureHandlerRootView>

  init {
    mDelegate = RNGestureHandlerRootViewManagerDelegate<RNGestureHandlerRootView, RNGestureHandlerRootViewManager>(this)
  }

  override fun getDelegate(): ViewManagerDelegate<RNGestureHandlerRootView> = mDelegate

  override fun getName() = REACT_CLASS

  override fun createViewInstance(reactContext: ThemedReactContext) = RNGestureHandlerRootView(reactContext)

  override fun onDropViewInstance(view: RNGestureHandlerRootView) {
    view.tearDown()
  }

  override fun setModuleId(view: RNGestureHandlerRootView, value: Int) {
    view.setModuleId(value)
  }

  @ReactProp(name = "unstable_forceActive")
  override fun setUnstable_forceActive(view: RNGestureHandlerRootView, active: Boolean) {
    view.setUnstableForceActive(active)
  }

  /**
   * The following event configuration is necessary even if you are not using
   * GestureHandlerRootView component directly.
   */
  override fun getExportedCustomDirectEventTypeConstants(): Map<String, Map<String, String>> = mutableMapOf(
    RNGestureHandlerEvent.EVENT_NAME to
      mutableMapOf("registrationName" to RNGestureHandlerEvent.EVENT_NAME),
    RNGestureHandlerStateChangeEvent.EVENT_NAME to
      mutableMapOf("registrationName" to RNGestureHandlerStateChangeEvent.EVENT_NAME),
  )

  companion object {
    const val REACT_CLASS = "RNGestureHandlerRootView"
  }
}
