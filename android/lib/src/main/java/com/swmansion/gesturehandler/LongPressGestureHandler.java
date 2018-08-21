package com.swmansion.gesturehandler;

import android.content.Context;
import android.os.Handler;
import android.view.MotionEvent;

public class LongPressGestureHandler extends GestureHandler<LongPressGestureHandler> {

  private static final long DEFAULT_MIN_DURATION_MS = 500; // 1 sec
  private static float DEFAULT_MAX_DIST_DP = 10; // 20dp

  private long mMinDurationMs = DEFAULT_MIN_DURATION_MS;
  private float mMaxDistSq;
  private float mStartX, mStartY;
  private float mLastX, mLastY;
  private float mLastEventOffsetX, mLastEventOffsetY;
  private Handler mHandler;

  public LongPressGestureHandler(Context context) {
    setShouldCancelWhenOutside(true);
    mMaxDistSq = DEFAULT_MAX_DIST_DP * context.getResources().getDisplayMetrics().density;
  }

  public void setMinDurationMs(long minDurationMs) {
    mMinDurationMs = minDurationMs;
  }

  public LongPressGestureHandler setMaxDist(float maxDist) {
    mMaxDistSq = maxDist * maxDist;
    return this;
  }

  @Override
  protected void onHandle(MotionEvent event) {
    if (getState() == STATE_UNDETERMINED) {
      begin();
      mStartX = event.getRawX();
      mStartY = event.getRawY();
      mHandler = new Handler();
      mHandler.postDelayed(new Runnable() {
        @Override
        public void run() {
          activate();
        }
      }, mMinDurationMs);
    }
    if (event.getActionMasked() == MotionEvent.ACTION_UP) {
      if (mHandler != null) {
        mHandler.removeCallbacksAndMessages(null);
        mHandler = null;
      }
      if (getState() == STATE_ACTIVE) {
        end();
      } else {
        fail();
      }
    } else {
      // calculate distance from start
      float deltaX = event.getRawX() - mStartX;
      float deltaY = event.getRawY() - mStartY;
      float distSq = deltaX * deltaX + deltaY * deltaY;
      if (distSq > mMaxDistSq) {
        if (getState() == STATE_ACTIVE) {
          cancel();
        } else {
          fail();
        }
      }
    }
    mLastX = GestureUtils.getLastPointerX(event, true);
    mLastY = GestureUtils.getLastPointerY(event, true);
    mLastEventOffsetX = event.getRawX() - event.getX();
    mLastEventOffsetY = event.getRawY() - event.getY();
  }

  @Override
  protected void onStateChange(int newState, int previousState) {
    if (mHandler != null) {
      mHandler.removeCallbacksAndMessages(null);
      mHandler = null;
    }
  }

  public float getLastAbsolutePositionX() {
    return mLastX;
  }

  public float getLastAbsolutePositionY() {
    return mLastY;
  }

  public float getLastRelativePositionX() {
    return mLastX - mLastEventOffsetX;
  }

  public float getLastRelativePositionY() {
    return mLastY - mLastEventOffsetY;
  }
}
