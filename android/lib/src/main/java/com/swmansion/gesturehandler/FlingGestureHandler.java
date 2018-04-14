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
  private int mDirection = DEFAULT_DIRECTION;
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

  public void setNumberOfTouchesRequired(int numberOfTouchesRequired) {
    mNumberOfTouchesRequired = numberOfTouchesRequired;
  }

  public void setDirection(int direction) {
    mDirection = direction;
  }

  private void startFling(MotionEvent event) {
    mStartX = event.getRawX();
    mStartY = event.getRawY();
    begin();
    mMaxNumberOfTouchesSimultaneously = 1;
    if (mHandler == null) {
      mHandler = new Handler();
    } else {
      mHandler.removeCallbacksAndMessages(null);
    }
    mHandler.postDelayed(mFailDelayed, mMaxDurationMs);
  }

  private void endFling(MotionEvent event) {
    if (mMaxNumberOfTouchesSimultaneously == mNumberOfTouchesRequired &&
            (((mDirection & DIRECTION_RIGHT) != 0 &&
                    event.getRawX() - mStartX > mMinAcceptableDelta) ||
            ((mDirection & DIRECTION_LEFT) !=0 &&
                    mStartX - event.getRawX() > mMinAcceptableDelta) ||
            ((mDirection & DIRECTION_UP) !=0 &&
                    mStartY - event.getRawY() > mMinAcceptableDelta) ||
            ((mDirection & DIRECTION_DOWN) !=0 &&
                    event.getRawY() - mStartY > mMinAcceptableDelta))) {
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
      startFling(event);
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
