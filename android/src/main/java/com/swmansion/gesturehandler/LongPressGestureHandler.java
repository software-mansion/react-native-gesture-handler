package com.swmansion.gesturehandler;

import android.os.Handler;
import android.os.SystemClock;
import android.view.MotionEvent;

public class LongPressGestureHandler extends GestureHandler<LongPressGestureHandler> {

  private static final long DEFAULT_MIN_DURATION_MS = 1000; // 1 sec

  private long mMinDurationMs = DEFAULT_MIN_DURATION_MS;
  private long mStarted;
  private Handler mHandler;

  public LongPressGestureHandler() {
    setCanStartHandlingWithDownEventOnly(true);
    setShouldCancelWhenOutside(true);
    setShouldCancelOthersWhenActivated(true);
  }

  public void setMinDurationMs(long minDurationMs) {
    mMinDurationMs = minDurationMs;
  }

  @Override
  protected void onHandle(MotionEvent event) {
    if (getState() == STATE_UNDETERMINED) {
      moveToState(STATE_BEGAN);
      mStarted = SystemClock.uptimeMillis();
      mHandler = new Handler();
      mHandler.postDelayed(new Runnable() {
        @Override
        public void run() {
          moveToState(STATE_ACTIVE);
        }
      }, mMinDurationMs);
    }
    if (getState() == STATE_BEGAN) {
      long elapsed = SystemClock.uptimeMillis() - mStarted;
      if (elapsed > mMinDurationMs) {
        moveToState(STATE_ACTIVE);
      }
    }
  }

  @Override
  protected void onStateChange(int previousState, int newState) {
    if (mHandler != null) {
      mHandler.removeCallbacksAndMessages(null);
      mHandler = null;
    }
  }

  @Override
  protected void onReset() {
    if (mHandler != null) {
      mHandler.removeCallbacksAndMessages(null);
      mHandler = null;
    }
  }
}
