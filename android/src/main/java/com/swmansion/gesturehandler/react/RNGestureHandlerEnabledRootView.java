package com.swmansion.gesturehandler.react;

import android.content.Context;
import android.util.AttributeSet;
import android.view.MotionEvent;

import com.facebook.react.ReactRootView;
import com.swmansion.gesturehandler.GestureHandlerOrchestrator;

public class RNGestureHandlerEnabledRootView extends ReactRootView {

  private final RNGestureHandlerRegistry mRegistry = new RNGestureHandlerRegistry();
  private final GestureHandlerOrchestrator mOrchestrator =
          new GestureHandlerOrchestrator(this, mRegistry);

  public RNGestureHandlerEnabledRootView(Context context) {
    super(context);
  }

  public RNGestureHandlerEnabledRootView(Context context, AttributeSet attrs) {
    super(context, attrs);
  }

  public RNGestureHandlerEnabledRootView(Context context, AttributeSet attrs, int defStyle) {
    super(context, attrs, defStyle);
  }

  @Override
  public boolean onInterceptTouchEvent(MotionEvent ev) {
    return true;
  }

  @Override
  public boolean onTouchEvent(MotionEvent ev) {
    return mOrchestrator.onTouchEvent(ev);
  }

  public RNGestureHandlerRegistry getRegistry() {
    return mRegistry;
  }
}
