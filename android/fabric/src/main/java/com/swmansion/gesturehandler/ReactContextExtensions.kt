package com.swmansion.gesturehandler

import com.facebook.react.bridge.ReactContext
import com.facebook.react.fabric.FabricUIManager
import com.facebook.react.uimanager.UIManagerHelper
import com.facebook.react.uimanager.common.UIManagerType
import com.facebook.react.uimanager.events.Event
import android.annotation.SuppressLint

fun ReactContext.dispatchEvent(event: Event<*>) {
  @SuppressLint("WrongConstant")
  val fabricUIManager = UIManagerHelper.getUIManager(this, UIManagerType.FABRIC) as FabricUIManager
  fabricUIManager.eventDispatcher.dispatchEvent(event)
}
