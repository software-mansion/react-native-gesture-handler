package com.swmansion.gesturehandler;

import android.os.SystemClock;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;

public class NativeViewGestureHandler extends GestureHandler<NativeViewGestureHandler> {

  private boolean mShouldActivateOnStart;

  public NativeViewGestureHandler() {
    setShouldCancelWhenOutside(true);
  }

  public NativeViewGestureHandler setShouldActivateOnStart(boolean shouldActivateOnStart) {
    mShouldActivateOnStart = shouldActivateOnStart;
    return this;
  }

  @Override
  protected void onHandle(MotionEvent event) {
    View view = getView();
    if (view instanceof ViewGroup) {
      onHandleForViewGroup((ViewGroup) view, event);
    } else {
      onHandleForView(view, event);
    }
  }

  private void onHandleForView(View view, MotionEvent event) {
    if (getState() == STATE_UNDETERMINED) {
      begin();
    }
    int action = event.getActionMasked();
    if (mShouldActivateOnStart && action == MotionEvent.ACTION_DOWN) {
      activate();
    } else if (action ==  MotionEvent.ACTION_UP) {
      activate();
      end();
    }
    view.onTouchEvent(event);
  }

  private void onHandleForViewGroup(ViewGroup view, MotionEvent event) {
    int state = getState();
    if (state == STATE_UNDETERMINED || state == STATE_BEGAN) {
      if (view.onInterceptTouchEvent(event)) {
        activate();
      } else if (state != STATE_BEGAN) {
        begin();
      }
    }
    if (getState() == STATE_ACTIVE) {
      view.onTouchEvent(event);
    }
    if (event.getActionMasked() == MotionEvent.ACTION_UP) {
      end();
    }
  }

  @Override
  protected void onCancel() {
    long time = SystemClock.uptimeMillis();
    MotionEvent event = MotionEvent.obtain(time, time, MotionEvent.ACTION_CANCEL, 0, 0, 0);
    event.setAction(MotionEvent.ACTION_CANCEL);
    getView().onTouchEvent(event);
  }
}
