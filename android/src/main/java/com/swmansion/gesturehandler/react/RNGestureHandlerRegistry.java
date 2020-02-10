package com.swmansion.gesturehandler.react;

import android.util.Log;
import android.util.SparseArray;
import android.view.View;

import com.swmansion.gesturehandler.DragGestureHandler;
import com.swmansion.gesturehandler.DropGestureHandler;
import com.swmansion.gesturehandler.GestureHandler;
import com.swmansion.gesturehandler.GestureHandlerRegistry;

import java.util.ArrayList;

import androidx.annotation.Nullable;

public class RNGestureHandlerRegistry implements GestureHandlerRegistry {

  private final SparseArray<GestureHandler> mHandlers = new SparseArray<>();
  private final SparseArray<Integer> mAttachedTo = new SparseArray<>();
  private final SparseArray<ArrayList<GestureHandler>> mHandlersForView = new SparseArray<>();
  private ArrayList<DragGestureHandler> mDragHandlers = new ArrayList<>();
  private ArrayList<DropGestureHandler> mDropZoneHandlers = new ArrayList<>();

  public synchronized void registerHandler(GestureHandler handler) {
    mHandlers.put(handler.getTag(), handler);
    if (handler instanceof DragGestureHandler) {
      mDragHandlers.add((DragGestureHandler) handler);
    } else if (handler instanceof DropGestureHandler) {
      mDropZoneHandlers.add((DropGestureHandler) handler);
    }
    Log.d("DragDrop", "registerHandler: " + handler + "  " + mDropZoneHandlers.size());
  }

  public synchronized @Nullable GestureHandler getHandler(int handlerTag) {
    return mHandlers.get(handlerTag);
  }

  @Override
  public synchronized ArrayList<DropGestureHandler> getDropHandlers() {
    return mDropZoneHandlers;
  }

  public synchronized boolean attachHandlerToView(int handlerTag, int viewTag) {
    GestureHandler handler = mHandlers.get(handlerTag);
    if (handler != null) {
      detachHandler(handler);
      registerHandlerForViewWithTag(viewTag, handler);
      return true;
    } else {
      return false;
    }
  }

  private synchronized void registerHandlerForViewWithTag(int viewTag, GestureHandler handler) {
    if (mAttachedTo.get(handler.getTag()) != null) {
      throw new IllegalStateException("Handler " + handler + " already attached");
    }
    mAttachedTo.put(handler.getTag(), viewTag);
    ArrayList<GestureHandler> listToAdd = mHandlersForView.get(viewTag);
    if (listToAdd == null) {
      listToAdd = new ArrayList<>(1);
      listToAdd.add(handler);
      mHandlersForView.put(viewTag, listToAdd);
    } else {
      listToAdd.add(handler);
    }
  }

  private synchronized void detachHandler(GestureHandler handler) {
    Integer attachedToView = mAttachedTo.get(handler.getTag());
    if (attachedToView != null) {
      mAttachedTo.remove(handler.getTag());
      ArrayList<GestureHandler> attachedHandlers = mHandlersForView.get(attachedToView);
      if (attachedHandlers != null) {
        attachedHandlers.remove(handler);
        if (attachedHandlers.size() == 0) {
          mHandlersForView.remove(attachedToView);
        }
      }
    }
    if (handler.getView() != null) {
      // Handler is in "prepared" state which means it is registered in the orchestrator and can
      // receive touch events. This means that before we remove it from the registry we need to
      // "cancel" it so that orchestrator does no longer keep a reference to it.
      handler.cancel();
    }

    if (handler instanceof DragGestureHandler) {
      mDragHandlers.remove((DragGestureHandler) handler);
    } else if (handler instanceof DropGestureHandler) {
      mDropZoneHandlers.add((DropGestureHandler) handler);
    }
  }

  public synchronized void dropHandler(int handlerTag) {
    GestureHandler handler = mHandlers.get(handlerTag);
    if (handler != null) {
      detachHandler(handler);
      mHandlers.remove(handlerTag);
    }
  }

  public synchronized void dropAllHandlers() {
    mHandlers.clear();
    mAttachedTo.clear();
    mHandlersForView.clear();
  }

  public synchronized ArrayList<GestureHandler> getHandlersForViewWithTag(int viewTag) {
    return mHandlersForView.get(viewTag);
  }

  @Override
  public synchronized ArrayList<GestureHandler> getHandlersForView(View view) {
    return getHandlersForViewWithTag(view.getId());
  }
}
