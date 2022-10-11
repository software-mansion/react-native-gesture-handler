package com.swmansion.gesturehandlerv2

import android.view.View
import android.view.ViewGroup

interface ViewConfigurationHelper {
  fun getPointerEventsConfigForView(view: View): PointerEventsConfig
  fun getChildInDrawingOrderAtIndex(parent: ViewGroup, index: Int): View
  fun isViewClippingChildren(view: ViewGroup): Boolean
}
