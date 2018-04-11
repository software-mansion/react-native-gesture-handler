package com.swmansion.gesturehandler;

import android.os.Handler;
import android.view.MotionEvent;

public class FlingGestureHandler extends GestureHandler<FlingGestureHandler> {
  private static final long DEFAULT_MAX_DURATION_MS = 800;
  private static final long DEFAULT_MIN_ACCEPTABLE_DELTA = 90;
  private static final int DEFAULT_DIRECTION = DIRECTION_RIGHT;
  private static final int DEFAULT_NUMBER_OF_TOUCHES_REQUIRED = 1;

  private long mMaxDurationMs = DEFAULT_MAX_DURATION_MS;
  private long mMinAcceptableDelta = DEFAULT_MIN_ACCEPTABLE_DELTA;

  private int direction = DEFAULT_DIRECTION;
  private int mNumberOfTouchesRequired = DEFAULT_NUMBER_OF_TOUCHES_REQUIRED;
  private float mStartX, mStartY;

  private Handler mHandler;
  private int mMaxNumberOfTouchesSimultaneously;

  private final Runnable mFailDelayed = new Runnable() {
    @Override
    public void run() {
      fail();
    }
  };

  public void setNumberOfTouchesRequired(int mNumberOfTouchesRequired) {
    this.mNumberOfTouchesRequired = mNumberOfTouchesRequired;
  }

  public void setDirection(int direction) {
    this.direction = direction;
  }

  private void startFling() {
    if (mHandler == null) {
      mHandler = new Handler();
    } else {
      mHandler.removeCallbacksAndMessages(null);
    }
    mHandler.postDelayed(mFailDelayed, mMaxDurationMs);
  }

  private void endFling(MotionEvent event) {
    if (mMaxNumberOfTouchesSimultaneously == mNumberOfTouchesRequired &&
            ((direction == DIRECTION_RIGHT && event.getX() - mStartX > mMinAcceptableDelta) ||
            (direction == DIRECTION_LEFT && mStartX - event.getX() > mMinAcceptableDelta) ||
            (direction == DIRECTION_UP && mStartY - event.getY() > mMinAcceptableDelta) ||
            (direction == DIRECTION_DOWN && event.getY() - mStartY > mMinAcceptableDelta))) {
      activate();
      end();
    } else {
      fail();
    }
  }

  @Override
  protected void onHandle(MotionEvent event) {
    int state = getState();

    if (state == STATE_UNDETERMINED) {
      mStartX = event.getRawX();
      mStartY = event.getRawY();
      begin();
      mMaxNumberOfTouchesSimultaneously = 1;
      startFling();
    }


    if (state == STATE_BEGAN) {
      if (event.getPointerCount() > mMaxNumberOfTouchesSimultaneously) {
        mMaxNumberOfTouchesSimultaneously = event.getPointerCount();
      }

      int action = event.getActionMasked();
      if (action == MotionEvent.ACTION_UP) {
        endFling(event);
      }
    }
  }

  @Override
  protected void onCancel() {
    if (mHandler != null) {
      mHandler.removeCallbacksAndMessages(null);
    }
  }

  @Override
  protected void onReset() {
    if (mHandler != null) {
      mHandler.removeCallbacksAndMessages(null);
    }
  }
}
