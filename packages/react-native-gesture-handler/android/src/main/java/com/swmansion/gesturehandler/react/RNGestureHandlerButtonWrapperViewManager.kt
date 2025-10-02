package com.swmansion.gesturehandler.react

import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.viewmanagers.RNGestureHandlerButtonWrapperManagerDelegate
import com.facebook.react.viewmanagers.RNGestureHandlerButtonWrapperManagerInterface

@ReactModule(name = RNGestureHandlerButtonWrapperViewManager.REACT_CLASS)
class RNGestureHandlerButtonWrapperViewManager :
  ViewGroupManager<RNGestureHandlerButtonWrapperView>(),
  RNGestureHandlerButtonWrapperManagerInterface<RNGestureHandlerButtonWrapperView> {
  private val mDelegate: ViewManagerDelegate<RNGestureHandlerButtonWrapperView>

  init {
    mDelegate =
      RNGestureHandlerButtonWrapperManagerDelegate<
        RNGestureHandlerButtonWrapperView,
        RNGestureHandlerButtonWrapperViewManager,
        >(this)
  }

  override fun getDelegate(): ViewManagerDelegate<RNGestureHandlerButtonWrapperView> = mDelegate

  override fun getName() = REACT_CLASS

  override fun createViewInstance(reactContext: ThemedReactContext) = RNGestureHandlerButtonWrapperView(reactContext)

  companion object {
    const val REACT_CLASS = "RNGestureHandlerButtonWrapper"
  }
}
