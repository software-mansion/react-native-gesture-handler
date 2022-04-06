package com.swmansion.gesturehandler

import com.facebook.react.bridge.ReactContext
import com.facebook.react.uimanager.events.Event
import com.swmansion.reanimated.ReanimatedModule

object ReanimatedEventDispatcher {
    fun <T : Event<T>>sendEvent(event: T, reactApplicationContext: ReactContext) {
        val reanimatedModule = reactApplicationContext.getNativeModule(ReanimatedModule::class.java)
        reanimatedModule?.nodesManager?.onEventDispatch(event)
    }
}