package com.swmansion.gesturehandler;

import android.content.Context;
import android.os.Handler;
import android.os.SystemClock;
import android.view.MotionEvent;

public class LongPressGestureHandler extends GestureHandler<LongPressGestureHandler> {

  private static final long DEFAULT_MIN_DURATION_MS = 500; // 1 sec
  private static final float DEFAULT_MAX_DIST_DP = 10; // 20dp

  private long mMinDurationMs = DEFAULT_MIN_DURATION_MS;
  private final float mDefaultMaxDistSq;
  private float mMaxDistSq;
  private float mStartX, mStartY;
  private long mStartTime, mPreviousTime;
  private Handler mHandler;

  public LongPressGestureHandler(Context context) {
    setShouldCancelWhenOutside(true);
    mDefaultMaxDistSq = DEFAULT_MAX_DIST_DP * context.getResources().getDisplayMetrics().density;
    mMaxDistSq = mDefaultMaxDistSq;
  }

  @Override
  public void resetConfig() {
    super.resetConfig();
    mMinDurationMs = DEFAULT_MIN_DURATION_MS;
    mMaxDistSq = mDefaultMaxDistSq;
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
      mStartTime = mPreviousTime = SystemClock.uptimeMillis();
      begin();
      mStartX = event.getRawX();
      mStartY = event.getRawY();
      mHandler = new Handler();
      if (mMinDurationMs > 0) {
        mHandler.postDelayed(new Runnable() {
          @Override
          public void run() {
            activate();
          }
        }, mMinDurationMs);
      } else if (mMinDurationMs == 0) {
        activate();
      }
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
      if (distSq > mMaxDistSq && getState() != STATE_ACTIVE) {
        fail();
      }
    }
  }

  @Override
  protected void onStateChange(int newState, int previousState) {
    if (mHandler != null) {
      mHandler.removeCallbacksAndMessages(null);
      mHandler = null;
    }
  }

  @Override
  void dispatchStateChange(int newState, int prevState) {
    mPreviousTime = SystemClock.uptimeMillis();
    super.dispatchStateChange(newState, prevState);
  }

  @Override
  void dispatchTouchEvent(MotionEvent event) {
    mPreviousTime = SystemClock.uptimeMillis();
    super.dispatchTouchEvent(event);
  }

  public int getDuration() {
    return (int)(mPreviousTime - mStartTime);
  }
}
