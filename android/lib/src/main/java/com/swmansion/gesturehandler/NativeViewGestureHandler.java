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
    if (!mDisallowInterruption) {
      return true;
    }
    return super.shouldRecognizeSimultaneously(handler);
  }

  @Override
  public boolean shouldBeCancelledBy(GestureHandler handler) {
    return !mDisallowInterruption;
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
    boolean delivered = false;
    if (state == STATE_UNDETERMINED || state == STATE_BEGAN) {
      if (view.isPressed()) {
        activate();
      } else {
        // view could become pressed due to
        view.onTouchEvent(event);
        delivered = true;
        if (view.onInterceptTouchEvent(event) || mShouldActivateOnStart || view.isPressed()) {
          activate();
        } else if (state != STATE_BEGAN) {
          begin();
        }
      }
    } else if (state == STATE_ACTIVE) {
      view.onTouchEvent(event);
      delivered = true;
    }
    if (event.getActionMasked() == MotionEvent.ACTION_UP) {
      if (!delivered) {
        view.onTouchEvent(event);
      }
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
