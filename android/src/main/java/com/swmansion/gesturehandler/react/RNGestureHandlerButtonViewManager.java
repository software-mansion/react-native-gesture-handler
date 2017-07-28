package com.swmansion.gesturehandler.react;

import android.annotation.TargetApi;
import android.content.Context;
import android.graphics.drawable.Drawable;
import android.os.Build;
import android.util.TypedValue;
import android.view.ViewGroup;

import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.ViewGroupManager;
import com.facebook.react.uimanager.annotations.ReactProp;

public class RNGestureHandlerButtonViewManager extends
        ViewGroupManager<RNGestureHandlerButtonViewManager.ButtonViewGroup> {

  static class ButtonViewGroup extends ViewGroup {

    static ButtonViewGroup sResponder;
    static Drawable mDrawableForPress;

    public ButtonViewGroup(Context context) {
      super(context);

      setClickable(true);
      setFocusable(true);

      setUseBorderlessDrawable(false);
    }

    public void setUseDrawableOnForeground(boolean useForeground) {
      if (useForeground && Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
        setBackground(null);
        setForeground(mDrawableForPress);
      } else {
        setBackground(mDrawableForPress);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
          setForeground(null);
        }
      }
    }

    public void setUseBorderlessDrawable(boolean useBorderless) {
      String identifier = useBorderless ? "selectableItemBackgroundBorderless"
              : "selectableItemBackground";
      updateBackground(identifier);
    }

    private void updateBackground(String identifier) {
      int attrID = getResources().getIdentifier(identifier, "attr", "android");
      TypedValue sResolveOutValue = new TypedValue();
      Drawable drawable;
      getContext().getTheme().resolveAttribute(attrID, sResolveOutValue, true);
      final int version = Build.VERSION.SDK_INT;
      if (version >= 21) {
        drawable = getResources().getDrawable(sResolveOutValue.resourceId, getContext().getTheme());
      } else {
        drawable = getResources().getDrawable(sResolveOutValue.resourceId);
      }
      if (drawable != null) {
        boolean shouldSetForeground = mDrawableForPress != null && getBackground() == null;
        mDrawableForPress = drawable;
        setUseDrawableOnForeground(shouldSetForeground);
      }
    }

    @Override
    protected void onLayout(boolean changed, int l, int t, int r, int b) {
      // No-op
    }

    @Override
    public void drawableHotspotChanged(float x, float y) {
      if (sResponder == null || sResponder == this) {
        super.drawableHotspotChanged(x, y);
      }
    }

    @Override
    public void setPressed(boolean pressed) {
      if (pressed && sResponder == null) {
        // first button to be pressed grabs button responder
        sResponder = this;
      }
      if (!pressed || sResponder == this) {
        // we set pressed state only for current responder
        super.setPressed(pressed);
      }
      if (!pressed && sResponder == this) {
        // if the responder is no longer pressed we release button responder
        sResponder = null;
      }
    }

    @Override
    public void dispatchDrawableHotspotChanged(float x, float y) {
      // by default viewgroup would pass hotspot change events
    }
  }

  @Override
  public String getName() {
    return "RNGestureHandlerButton";
  }

  @Override
  public ButtonViewGroup createViewInstance(ThemedReactContext context) {
    return new ButtonViewGroup(context);
  }

  @TargetApi(Build.VERSION_CODES.M)
  @ReactProp(name = "foreground")
  public void setForeground(ButtonViewGroup view, boolean useDrawableOnForeground) {
    view.setUseDrawableOnForeground(useDrawableOnForeground);
  }

  @ReactProp(name = "borderless")
  public void setBorderless(ButtonViewGroup view, boolean useBorderlessDrawable) {
    view.setUseBorderlessDrawable(useBorderlessDrawable);
  }

}
