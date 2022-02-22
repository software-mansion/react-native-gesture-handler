package com.swmansion.gesturehandler

import com.facebook.react.bridge.ReactContext
import com.facebook.react.uimanager.UIManagerModule
import com.facebook.react.uimanager.events.Event

fun ReactContext.dispatchEvent(event: Event<*>) {
    this.getNativeModule(UIManagerModule::class.java)!!.eventDispatcher.dispatchEvent(event)
}
