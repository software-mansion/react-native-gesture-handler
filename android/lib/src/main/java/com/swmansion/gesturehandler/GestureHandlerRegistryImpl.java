package com.swmansion.gesturehandler;

import android.view.View;

import java.util.ArrayList;
import java.util.WeakHashMap;

public class GestureHandlerRegistryImpl implements GestureHandlerRegistry {

  private WeakHashMap<View, ArrayList<GestureHandler>> mHandlers = new WeakHashMap<>();
  private ArrayList<DropGestureHandler> mDropHandlers = new ArrayList<>();

  public <T extends GestureHandler> T registerHandlerForView(View view, T handler) {
    ArrayList<GestureHandler> listToAdd = mHandlers.get(view);
    if (listToAdd == null) {
      listToAdd = new ArrayList<>(1);
      listToAdd.add(handler);
      mHandlers.put(view, listToAdd);
    } else {
      listToAdd.add(handler);
    }
    if (handler instanceof DropGestureHandler || handler instanceof DragGestureHandler) {
      ((DragDropGestureHandler) handler).setTarget(view);
      if (handler instanceof DropGestureHandler) {
        mDropHandlers.add((DropGestureHandler) handler);
      }
    }
    return handler;
  }

  @Override
  public ArrayList<GestureHandler> getHandlersForView(View view) {
    return mHandlers.get(view);
  }

  @Override
  public ArrayList<DropGestureHandler> getDropHandlers() {
    return mDropHandlers;
  }
}

