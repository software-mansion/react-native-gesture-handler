package com.swmansion.gesturehandler.react;

import android.content.Context;
import android.view.MotionEvent;

import com.facebook.infer.annotation.Assertions;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.views.view.ReactViewGroup;

import androidx.annotation.Nullable;

public class RNGestureHandlerRootView extends ReactViewGroup {

  private @Nullable RNGestureHandlerRootHelper mRootHelper;
  private Boolean interceptTouchOutside = false;

  public RNGestureHandlerRootView(Context context) {
    super(context);
  }

  @Override
  protected void onAttachedToWindow() {
    super.onAttachedToWindow();
    if (mRootHelper == null) {
      mRootHelper = new RNGestureHandlerRootHelper((ReactContext) getContext(), this);
    }
  }

  @Override
  public boolean onTouchEvent(MotionEvent ev) {
    return interceptTouchOutside;
  }

  public void setInterceptTouchOutside(Boolean interceptTouchOutside) {
    this.interceptTouchOutside = interceptTouchOutside;
  }

  public void tearDown() {
    if (mRootHelper != null) {
      mRootHelper.tearDown();
    }
  }

  @Override
  public boolean dispatchTouchEvent(MotionEvent ev) {
    if (Assertions.assertNotNull(mRootHelper).dispatchTouchEvent(ev)) {
      return true;
    }
    return super.dispatchTouchEvent(ev);
  }

  @Override
  public void requestDisallowInterceptTouchEvent(boolean disallowIntercept) {
    Assertions.assertNotNull(mRootHelper).requestDisallowInterceptTouchEvent(disallowIntercept);
    super.requestDisallowInterceptTouchEvent(disallowIntercept);
  }
}
