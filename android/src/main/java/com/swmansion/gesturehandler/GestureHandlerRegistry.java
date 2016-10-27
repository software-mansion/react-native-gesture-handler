package com.swmansion.gesturehandler;

import android.view.View;

import java.util.ArrayList;

public interface GestureHandlerRegistry {
  ArrayList<GestureHandler> getHandlersForView(View view);
}
