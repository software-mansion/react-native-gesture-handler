package com.swmansion.gesturehandler;

import android.os.SystemClock;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;

import com.swmansion.gesturehandler.GestureHandler;

public class NativeViewGestureHandler extends GestureHandler<NativeViewGestureHandler> {

  public NativeViewGestureHandler() {
    setShouldCancelOthersWhenActivated(true);
    setCanStartHandlingWithDownEventOnly(true);
    setShouldCancelWhenOutside(true);
  }

  @Override
  protected void onHandle(MotionEvent event) {
    int state = getState();
    boolean shouldCallOnIntercept = (getView() instanceof ViewGroup);
    if ((state == STATE_UNDETERMINED || state == STATE_BEGAN)) {
      if (shouldCallOnIntercept) {
        if (((ViewGroup) getView()).onInterceptTouchEvent(event)) {
          moveToState(STATE_ACTIVE);
        } else if (state != STATE_BEGAN) {
          moveToState(STATE_BEGAN);
        }
      } else {
        moveToState(STATE_ACTIVE);
      }
    }
    if (getState() == STATE_ACTIVE) {
      getView().onTouchEvent(event);
    }
  }

  @Override
  protected void onCancel() {
//    int restoreAction = event.getAction();
    long time = SystemClock.uptimeMillis();
    MotionEvent event = MotionEvent.obtain(time, time, MotionEvent.ACTION_CANCEL, 0, 0, 0);
    event.setAction(MotionEvent.ACTION_CANCEL);
    getView().onTouchEvent(event);
  }
}
