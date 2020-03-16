package com.swmansion.gesturehandler.react;

import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.swmansion.gesturehandler.GestureHandler;
import com.swmansion.gesturehandler.GestureHandlerInteractionManager;

public class RNGestureHandlerInteractionManager extends GestureHandlerInteractionManager {

  private static final String KEY_WAIT_FOR = "waitFor";
  static final String KEY_SIMULTANEOUS_HANDLERS = "simultaneousHandlers";

  private int[] convertHandlerTagsArray(ReadableMap config, String key) {
    ReadableArray array = config.getArray(key);
    int[] result = new int[array.size()];
    for (int i = 0; i < result.length; i++) {
      result[i] = array.getInt(i);
    }
    return result;
  }

  public void configureInteractions(GestureHandler handler, ReadableMap config) {
    super.configureInteractions(
            handler,
            config.hasKey(KEY_WAIT_FOR) ? convertHandlerTagsArray(config, KEY_WAIT_FOR) : null,
            config.hasKey(KEY_SIMULTANEOUS_HANDLERS) ? convertHandlerTagsArray(config, KEY_SIMULTANEOUS_HANDLERS) : null
            );
  }
}
