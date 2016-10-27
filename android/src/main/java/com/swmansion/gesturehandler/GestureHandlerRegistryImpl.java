package com.swmansion.gesturehandler;

import android.view.View;

import java.util.ArrayList;
import java.util.WeakHashMap;

public class GestureHandlerRegistryImpl implements GestureHandlerRegistry {

  private WeakHashMap<View, ArrayList<GestureHandler>> mHandlers = new WeakHashMap<>();

  public void registerHandlerForView(View view, GestureHandler handler) {
    ArrayList<GestureHandler> listToAdd = mHandlers.get(view);
    if (listToAdd == null) {
      listToAdd = new ArrayList<>(1);
      listToAdd.add(handler);
      mHandlers.put(view, listToAdd);
    } else {
      listToAdd.add(handler);
    }
  }

  @Override
  public ArrayList<GestureHandler> getHandlersForView(View view) {
    return mHandlers.get(view);
  }
}

