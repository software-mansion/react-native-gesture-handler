package com.swmansion.gesturehandler;

import android.content.Context;
import android.util.AttributeSet;
import android.view.MotionEvent;
import android.widget.FrameLayout;

public class GestureHandlerViewWrapper extends FrameLayout {

  private final GestureHandlerOrchestrator mOrchestrator;

  public GestureHandlerViewWrapper(Context context) {
    super(context);
    mOrchestrator = new GestureHandlerOrchestrator(this);
  }

  public GestureHandlerViewWrapper(Context context, AttributeSet attrs) {
    super(context, attrs);
    mOrchestrator = new GestureHandlerOrchestrator(this);
  }

  public GestureHandlerViewWrapper(Context context, AttributeSet attrs, int defStyleAttr) {
    super(context, attrs, defStyleAttr);
    mOrchestrator = new GestureHandlerOrchestrator(this);
  }

  public GestureHandlerOrchestrator getOrchestrator() {
    return mOrchestrator;
  }

  @Override
  public boolean onInterceptTouchEvent(MotionEvent ev) {
    return true;
  }

  @Override
  public boolean onTouchEvent(MotionEvent event) {
    return mOrchestrator.onTouchEvent(event);
  }
}
