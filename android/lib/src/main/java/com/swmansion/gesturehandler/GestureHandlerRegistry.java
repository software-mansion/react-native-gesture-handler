package com.swmansion.gesturehandler;

import android.util.SparseArray;
import android.view.View;

import androidx.annotation.Nullable;

import java.util.ArrayList;

public interface GestureHandlerRegistry {
  ArrayList<GestureHandler> getHandlersForView(View view);
  View getViewForHandler(DragGestureHandler handler);
  @Nullable GestureHandler getHandler(int handlerTag);
}
