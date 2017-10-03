package com.swmansion.gesturehandler.react;

import android.util.SparseArray;
import android.view.View;

import com.facebook.react.uimanager.ReactPointerEventsView;
import com.swmansion.gesturehandler.GestureHandler;
import com.swmansion.gesturehandler.GestureHandlerRegistry;
import com.swmansion.gesturehandler.PointerEvents;

import java.util.ArrayList;

import javax.annotation.Nullable;

public class RNGestureHandlerRegistry implements GestureHandlerRegistry {

  private SparseArray<GestureHandler> mHandlers = new SparseArray<>();
  private SparseArray<Integer> mAttachedTo = new SparseArray<>();
  private SparseArray<ArrayList<GestureHandler>> mHandlersForView = new SparseArray<>();

  public void registerHandler(GestureHandler handler) {
    mHandlers.put(handler.getTag(), handler);
  }

  public @Nullable GestureHandler getHandler(int handlerTag) {
    return mHandlers.get(handlerTag);
  }

  public boolean attachHandlerToView(int handlerTag, int viewTag) {
    GestureHandler handler = mHandlers.get(handlerTag);
    if (handler != null) {
      detachHandler(handler);
      registerHandlerForViewWithTag(viewTag, handler);
      return true;
    } else {
      return false;
    }
  }

  private void registerHandlerForViewWithTag(int viewTag, GestureHandler handler) {
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

  private void detachHandler(GestureHandler handler) {
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
  }

  public void dropHandler(int handlerTag) {
    GestureHandler handler = mHandlers.get(handlerTag);
    if (handler != null) {
      detachHandler(handler);
      mHandlers.remove(handlerTag);
    }
  }

  public void dropAllHandlers() {
    mHandlers.clear();
    mAttachedTo.clear();
    mHandlersForView.clear();
  }

  public ArrayList<GestureHandler> getHandlersForViewWithTag(int viewTag) {
    return mHandlersForView.get(viewTag);
  }

  @Override
  public ArrayList<GestureHandler> getHandlersForView(View view) {
    return getHandlersForViewWithTag(view.getId());
  }

  @Override
  public PointerEvents getPointerEventsConfigForView(View view) {
    com.facebook.react.uimanager.PointerEvents pointerEvents;
    pointerEvents = view instanceof ReactPointerEventsView ?
            ((ReactPointerEventsView) view).getPointerEvents() :
            com.facebook.react.uimanager.PointerEvents.AUTO;

    // Views that are disabled should never be the target of pointer events. However, their children
    // can be because some views (SwipeRefreshLayout) use enabled but still have children that can
    // be valid targets.
    if (!view.isEnabled()) {
      if (pointerEvents == com.facebook.react.uimanager.PointerEvents.AUTO) {
        return PointerEvents.BOX_NONE;
      } else if (pointerEvents == com.facebook.react.uimanager.PointerEvents.BOX_ONLY) {
        return PointerEvents.NONE;
      }
    }

    switch (pointerEvents) {
      case BOX_ONLY: return PointerEvents.BOX_ONLY;
      case BOX_NONE: return PointerEvents.BOX_NONE;
      case NONE: return PointerEvents.NONE;
    }

    return PointerEvents.AUTO;
  }
}
