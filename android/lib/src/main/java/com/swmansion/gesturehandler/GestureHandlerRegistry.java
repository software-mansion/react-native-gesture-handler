package com.swmansion.gesturehandler;

import android.view.View;

import androidx.annotation.Nullable;

import java.util.ArrayList;

public interface GestureHandlerRegistry {
  ArrayList<GestureHandler> getHandlersForView(View view);
  View getViewForHandler(GestureHandler handler);
  @Nullable GestureHandler getHandler(int handlerTag);
}
