package com.swmansion.gesturehandler.react

import com.facebook.react.module.annotations.ReactModule
import com.facebook.react.uimanager.ThemedReactContext
import com.facebook.react.uimanager.ViewGroupManager
import com.facebook.react.uimanager.ViewManagerDelegate
import com.facebook.react.viewmanagers.RNGestureHandlerButtonWrapperManagerDelegate
import com.facebook.react.viewmanagers.RNGestureHandlerButtonWrapperManagerInterface
import com.facebook.react.views.view.ReactViewGroup

@ReactModule(name = RNGestureHandlerButtonWrapperViewManager.REACT_CLASS)
class RNGestureHandlerButtonWrapperViewManager :
  ViewGroupManager<ReactViewGroup>(),
  RNGestureHandlerButtonWrapperManagerInterface<ReactViewGroup> {
  private val mDelegate: ViewManagerDelegate<ReactViewGroup> =
    RNGestureHandlerButtonWrapperManagerDelegate<
      ReactViewGroup,
      RNGestureHandlerButtonWrapperViewManager,
      >(this)

  override fun getDelegate(): ViewManagerDelegate<ReactViewGroup> = mDelegate

  override fun getName() = REACT_CLASS

  override fun createViewInstance(reactContext: ThemedReactContext) = ReactViewGroup(reactContext)

  companion object {
    const val REACT_CLASS = "RNGestureHandlerButtonWrapper"
  }
}
