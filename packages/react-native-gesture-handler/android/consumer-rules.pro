# Reached only by reflection in NativeViewGestureHandler, so R8 would otherwise strip it.
-keep interface com.facebook.react.uimanager.HasChildPressedStateDelay {
  void setHasChildPressedStateDelay(java.lang.Boolean);
}
