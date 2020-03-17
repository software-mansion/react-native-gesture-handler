package com.swmansion.gesturehandler;

import android.util.SparseArray;
import android.view.View;

import androidx.annotation.Nullable;

import java.util.ArrayList;
import java.util.WeakHashMap;

public class GestureHandlerRegistryImpl implements GestureHandlerRegistry {

  private final WeakHashMap<View, ArrayList<GestureHandler>> mHandlersForView = new WeakHashMap<>();
  private final SparseArray<View> mViewForTag = new SparseArray<>();
  private final SparseArray<GestureHandler> mHandlers = new SparseArray<>();

  public <T extends GestureHandler> T registerHandlerForView(View view, T handler) {
    ArrayList<GestureHandler> listToAdd = mHandlersForView.get(view);
    if (listToAdd == null) {
      listToAdd = new ArrayList<>(1);
      listToAdd.add(handler);
      mHandlersForView.put(view, listToAdd);
    } else {
      listToAdd.add(handler);
    }
    if (mHandlers.get(handler.getTag()) == null) {
      mHandlers.put(handler.getTag(), handler);
      mViewForTag.put(handler.getTag(), view);
    }
    return handler;
  }

  @Override
  public ArrayList<GestureHandler> getHandlersForView(View view) {
    return mHandlersForView.get(view);
  }

  @Nullable
  @Override
  public GestureHandler getHandler(int handlerTag) {
    return mHandlers.get(handlerTag);
  }

  @Override
  public View getViewForHandler(GestureHandler handler) {
    return mViewForTag.get(handler.getTag());
  }
}

