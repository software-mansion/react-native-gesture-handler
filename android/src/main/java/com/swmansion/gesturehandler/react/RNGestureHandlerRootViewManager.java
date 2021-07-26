package com.swmansion.gesturehandler.react;

import com.facebook.react.common.MapBuilder;
import com.facebook.react.module.annotations.ReactModule;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.ViewGroupManager;

import java.util.HashMap;
import java.util.Map;

import androidx.annotation.Nullable;

/**
 * React native's view manager used for creating instances of {@link }RNGestureHandlerRootView}. It
 * is being used by projects using react-native-navigation where for each screen new root view need
 * to be provided.
 */
@ReactModule(name = RNGestureHandlerRootViewManager.REACT_CLASS)
public class RNGestureHandlerRootViewManager extends ViewGroupManager<RNGestureHandlerRootView> {

  public static final String REACT_CLASS = "GestureHandlerRootView";

  @Override
  public String getName() {
    return REACT_CLASS;
  }

  @Override
  protected RNGestureHandlerRootView createViewInstance(ThemedReactContext reactContext) {
    return new RNGestureHandlerRootView(reactContext);
  }

  @Override
  public void onDropViewInstance(RNGestureHandlerRootView view) {
    view.tearDown();
  }

  /**
   * The following event configuration is necessary even if you are not using
   * GestureHandlerRootView component directly.
   */
  @Override
  public @Nullable Map getExportedCustomDirectEventTypeConstants() {
    HashMap<String, Map> result = new HashMap<>();

    result.put(RNGestureHandlerEvent.EVENT_NAME, MapBuilder.of("registrationName", RNGestureHandlerEvent.EVENT_NAME));
    result.put(RNGestureHandlerStateChangeEvent.EVENT_NAME, MapBuilder.of("registrationName", RNGestureHandlerStateChangeEvent.EVENT_NAME));
    result.put("onPanEvent", MapBuilder.of("registrationName", "onPanEvent"));
    result.put("onFlingEvent", MapBuilder.of("registrationName", "onFlingEvent"));
    result.put("onLongPressEvent", MapBuilder.of("registrationName", "onLongPressEvent"));
    result.put("onRotationEvent", MapBuilder.of("registrationName", "onRotationEvent"));
    result.put("onPinchEvent", MapBuilder.of("registrationName", "onPinchEvent"));
    result.put("onTapEvent", MapBuilder.of("registrationName", "onTapEvent"));

    return result;
  }
}
