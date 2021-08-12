package com.swmansion.gesturehandler.react

import android.view.View
import com.facebook.react.uimanager.SimpleViewManager
import com.facebook.react.uimanager.ThemedReactContext

class RNGestureHandlerEventReceiverViewManager : SimpleViewManager<View>() {
    override fun getName() = "RNGestureHandlerEventReceiver"

    override fun createViewInstance(reactContext: ThemedReactContext)
        = View(reactContext).apply { visibility = View.GONE }
}