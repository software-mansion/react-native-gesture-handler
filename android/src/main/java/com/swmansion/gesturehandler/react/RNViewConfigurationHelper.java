package com.swmansion.gesturehandler.react;

import android.view.View;
import android.view.ViewGroup;

import com.facebook.react.uimanager.PointerEvents;
import com.facebook.react.uimanager.ReactPointerEventsView;
import com.facebook.react.views.view.ReactViewGroup;
import com.swmansion.gesturehandler.PointerEventsConfig;
import com.swmansion.gesturehandler.ViewConfigurationHelper;

import java.lang.reflect.Field;

import javax.annotation.Nullable;

public class RNViewConfigurationHelper implements ViewConfigurationHelper {

  private @Nullable Field mOverflowField;

  public RNViewConfigurationHelper() {
    try {
      mOverflowField = ReactViewGroup.class.getDeclaredField("mOverflow");
      mOverflowField.setAccessible(true);
    } catch (NoSuchFieldException e) {
      e.printStackTrace();
    }
  }

  @Override
  public PointerEventsConfig getPointerEventsConfigForView(View view) {
    PointerEvents pointerEvents;
    pointerEvents = view instanceof ReactPointerEventsView ?
            ((ReactPointerEventsView) view).getPointerEvents() :
            PointerEvents.AUTO;

    // Views that are disabled should never be the target of pointer events. However, their children
    // can be because some views (SwipeRefreshLayout) use enabled but still have children that can
    // be valid targets.
    if (!view.isEnabled()) {
      if (pointerEvents == PointerEvents.AUTO) {
        return PointerEventsConfig.BOX_NONE;
      } else if (pointerEvents == PointerEvents.BOX_ONLY) {
        return PointerEventsConfig.NONE;
      }
    }

    switch (pointerEvents) {
      case BOX_ONLY: return PointerEventsConfig.BOX_ONLY;
      case BOX_NONE: return PointerEventsConfig.BOX_NONE;
      case NONE: return PointerEventsConfig.NONE;
    }

    return PointerEventsConfig.AUTO;
  }

  @Override
  public View getChildInDrawingOrderAtIndex(ViewGroup parent, int index) {
    if (parent instanceof ReactViewGroup) {
      return parent.getChildAt(((ReactViewGroup) parent).getZIndexMappedChildIndex(index));
    }
    return parent.getChildAt(index);
  }

  @Override
  public boolean isViewClippingChildren(ViewGroup view) {
    if (!view.getClipChildren()) {
      if (mOverflowField != null && view instanceof ReactViewGroup) {
        try {
          String overflow = (String) mOverflowField.get(view);
          return "hidden".equals(overflow);
        } catch (IllegalAccessException e) {
          // ignore
        }
      }
      return false;
    }
    return true;
  }
}
