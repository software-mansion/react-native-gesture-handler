package com.swmansion.gesturehandler;

import android.os.SystemClock;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;

public class NativeViewGestureHandler extends GestureHandler<NativeViewGestureHandler> {

  private boolean mShouldActivateOnStart;
  private boolean mDisallowInterruption;

  public NativeViewGestureHandler() {
    setShouldCancelWhenOutside(true);
  }

  public NativeViewGestureHandler setShouldActivateOnStart(boolean shouldActivateOnStart) {
    mShouldActivateOnStart = shouldActivateOnStart;
    return this;
  }

  /**
   * Set this to {@code true} when wrapping native components that are supposed to be an exclusive
   * target for a touch stream. Like for example switch or slider component which when activated
   * aren't supposed to be cancelled by scrollview or other container that may also handle touches.
   */
  public NativeViewGestureHandler setDisallowInterruption(boolean disallowInterruption) {
    mDisallowInterruption = disallowInterruption;
    return this;
  }

  @Override
  public boolean shouldRequireToWaitForFailure(GestureHandler handler) {
    return super.shouldRequireToWaitForFailure(handler);
  }

  @Override
  public boolean shouldRecognizeSimultaneously(GestureHandler handler) {
    return !mDisallowInterruption;
  }

  @Override
  public boolean shouldBeCancelledBy(GestureHandler handler) {
    return !mDisallowInterruption;
  }

  @Override
  protected void onHandle(MotionEvent event) {
    View view = getView();
    int state = getState();
    if (event.getActionMasked() == MotionEvent.ACTION_UP) {
      view.onTouchEvent(event);
      if ((state == STATE_UNDETERMINED || state == STATE_BEGAN) && view.isPressed()) {
        activate();
      }
      end();
    } else if (state == STATE_UNDETERMINED || state == STATE_BEGAN) {
      if (mShouldActivateOnStart || view.isPressed()) {
        view.onTouchEvent(event);
        activate();
      } else {
        // view could become pressed due to
        view.onTouchEvent(event);
        if (view.isPressed()) {
          activate();
        } else if (view instanceof ViewGroup && ((ViewGroup) view).onInterceptTouchEvent(event)) {
          activate();
        } else if (state != STATE_BEGAN) {
          begin();
        }
      }
    } else if (state == STATE_ACTIVE) {
      view.onTouchEvent(event);
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
