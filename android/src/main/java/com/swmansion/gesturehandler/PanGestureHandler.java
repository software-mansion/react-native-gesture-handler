package com.swmansion.gesturehandler;

import android.view.MotionEvent;
import android.view.VelocityTracker;

public class PanGestureHandler extends GestureHandler<PanGestureHandler> {

  private static float MIN_DISTANCE_IGNORE = Float.MAX_VALUE;

  private static float DEFAULT_MIN_DISTANCE = 10.0f;
  private static float DEFAULT_MAX_VELOCITY = 50.0f;

  private float mMinDeltaX = MIN_DISTANCE_IGNORE;
  private float mMinDeltaY = MIN_DISTANCE_IGNORE;
  private float mMinDistSq = DEFAULT_MIN_DISTANCE * DEFAULT_MIN_DISTANCE;
  private float mMaxVelocitySq = DEFAULT_MAX_VELOCITY;

  private float mStartX, mStartY;
  private float mLastX, mLastY;
  private VelocityTracker mVelocityTracker;

  public PanGestureHandler setMinDx(float deltaX) {
    mMinDeltaX = deltaX;
    return this;
  }

  public PanGestureHandler setMinDy(float deltaY) {
    mMinDeltaY = deltaY;
    return this;
  }

  public PanGestureHandler setMinDist(float minDist) {
    mMinDistSq = minDist * minDist;
    return this;
  }

  /**
   * @param maxVelocity in pixels per millisecond
   */
  public PanGestureHandler setMaxVelocity(float maxVelocity) {
    mMaxVelocitySq = maxVelocity * maxVelocity;
    return this;
  }

  @Override
  protected void onHandle(MotionEvent event) {
    int state = getState();
    mLastX = event.getRawX();
    mLastY = event.getRawY();
    if (state == STATE_UNDETERMINED) {
      mStartX = mLastX;
      mStartY = mLastY;
      mVelocityTracker = VelocityTracker.obtain();
      mVelocityTracker.addMovement(event);
      moveToState(STATE_BEGAN);
    } else if (state == STATE_BEGAN) {
      float dx = Math.abs(mStartX - mLastX);
      float dy = Math.abs(mStartY - mLastY);
      float distSq = dx * dx + dy * dy;
      mVelocityTracker.addMovement(event);
      mVelocityTracker.computeCurrentVelocity(1);
      float velocityX = mVelocityTracker.getXVelocity();
      float velocityY = mVelocityTracker.getYVelocity();
      float velocitySq = velocityX * velocityX + velocityY * velocityY;
      if (velocitySq < mMaxVelocitySq &&
              (distSq > mMinDistSq || dx > mMinDeltaX || dy > mMinDeltaY)) {
        moveToState(STATE_ACTIVE);
      }
    }
  }

  @Override
  protected void onReset() {
    if (mVelocityTracker != null) {
      mVelocityTracker.recycle();
      mVelocityTracker = null;
    }
  }

  public float getTranslationX() {
    return mLastX - mStartX;
  }

  public float getTranslationY() {
    return mLastY - mStartY;
  }
}
