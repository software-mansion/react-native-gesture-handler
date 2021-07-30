package com.swmansion.gesturehandler;

import android.util.SparseArray;
import android.view.View;

import androidx.annotation.Nullable;

import java.util.ArrayList;
import java.util.WeakHashMap;

public class GestureHandlerRegistryImpl implements GestureHandlerRegistry {

  private final WeakHashMap<View, ArrayList<GestureHandler>> mHandlersForView = new WeakHashMap<>();
  private final SparseArray<View> mViewForHandlerTag = new SparseArray<>();
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
      mViewForHandlerTag.put(handler.getTag(), view);
    }
    return handler;
  }

  private void detachHandler(GestureHandler handler) {
    View handlerView = mViewForHandlerTag.get(handler.getTag());
    if (handlerView != null) {
      mViewForHandlerTag.remove(handler.getTag());
      ArrayList<GestureHandler> attachedHandlers = mHandlersForView.get(handlerView);
      if (attachedHandlers != null) {
        attachedHandlers.remove(handler);
        if (attachedHandlers.size() == 0) {
          mHandlersForView.remove(handlerView);
        }
      }
    }
    if (handler.getView() != null) {
      // Handler is in "prepared" state which means it is registered in the orchestrator and can
      // receive touch events. This means that before we remove it from the registry we need to
      // "cancel" it so that orchestrator does no longer keep a reference to it.
      handler.cancel();
    }
  }

  public void dropHandler(int handlerTag) {
    GestureHandler handler = mHandlers.get(handlerTag);
    if (handler != null) {
      detachHandler(handler);
      mHandlers.remove(handlerTag);
    }
  }

  public synchronized void dropHandlersForView(View view) {
    ArrayList<GestureHandler> handlers = mHandlersForView.get(view);
    if (handlers != null) {
      for (GestureHandler handler: handlers.toArray(new GestureHandler[0])) {
        dropHandler(handler.getTag());
      }
    }
  }

  public synchronized void dropAllHandlers() {
    mHandlersForView.clear();
    mViewForHandlerTag.clear();
    mHandlers.clear();
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
    return mViewForHandlerTag.get(handler.getTag());
  }
}