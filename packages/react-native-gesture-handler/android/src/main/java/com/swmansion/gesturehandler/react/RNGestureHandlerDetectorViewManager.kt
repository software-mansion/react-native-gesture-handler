package com.swmansion.gesturehandler.react

import com.facebook.react.bridge.ReadableArray
import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.PointerEvents.Companion.parsePointerEvents
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.viewmanagers.RNGestureHandlerDetectorManagerDelegate
import com.facebook.react.viewmanagers.RNGestureHandlerDetectorManagerInterface

@ReactModule(name = RNGestureHandlerDetectorViewManager.REACT_CLASS)
class RNGestureHandlerDetectorViewManager :
  ViewGroupManager<RNGestureHandlerDetectorView>(),
  RNGestureHandlerDetectorManagerInterface<RNGestureHandlerDetectorView> {
  private val mDelegate: ViewManagerDelegate<RNGestureHandlerDetectorView>

  init {
    mDelegate =
      RNGestureHandlerDetectorManagerDelegate<RNGestureHandlerDetectorView, RNGestureHandlerDetectorViewManager>(this)
  }

  override fun getDelegate(): ViewManagerDelegate<RNGestureHandlerDetectorView> = mDelegate

  override fun getName() = REACT_CLASS

  override fun createViewInstance(reactContext: ThemedReactContext) = RNGestureHandlerDetectorView(reactContext)

  companion object {
    const val REACT_CLASS = "RNGestureHandlerDetector"
  }

  override fun setHandlerTags(view: RNGestureHandlerDetectorView, value: ReadableArray?) {
    view.setHandlerTags(value)
  }

  override fun setModuleId(view: RNGestureHandlerDetectorView, value: Int) {
    view.setModuleId(value)
  }

  override fun setVirtualChildren(view: RNGestureHandlerDetectorView, value: ReadableArray?) {
    view.setVirtualChildren(value)
  }

  override fun onDropViewInstance(view: RNGestureHandlerDetectorView) {
    view.detachAllHandlers()
    super.onDropViewInstance(view)
  }

  override fun setPointerEvents(view: RNGestureHandlerDetectorView, pointerEventsStr: String?) {
    view.pointerEvents = parsePointerEvents(pointerEventsStr)
  }
}
