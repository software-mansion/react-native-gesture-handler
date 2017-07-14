package com.swmansion.gesturehandler;

import android.view.MotionEvent;
import android.view.VelocityTracker;

public class PanGestureHandler extends GestureHandler<PanGestureHandler> {

  private static float MIN_DISTANCE_IGNORE = Float.MAX_VALUE;

  private static float DEFAULT_MIN_DISTANCE = 10.0f;
  private static float DEFAULT_MAX_VELOCITY = 50.0f;
  private static int DEFAULT_MIN_POINTERS = 1;
  private static int DEFAULT_MAX_POINTERS = 10;

  private float mMinDeltaX = MIN_DISTANCE_IGNORE;
  private float mMinDeltaY = MIN_DISTANCE_IGNORE;
  private float mMinDistSq = DEFAULT_MIN_DISTANCE * DEFAULT_MIN_DISTANCE;
  private float mMaxVelocitySq = DEFAULT_MAX_VELOCITY;
  private int mMinPointers = DEFAULT_MIN_POINTERS;
  private int mMaxPointers = DEFAULT_MAX_POINTERS;

  private float mStartX, mStartY;
  private float mOffsetX, mOffsetY;
  private float mLastX, mLastY;
  private float mLastVelocityX, mLastVelocityY;
  private VelocityTracker mVelocityTracker;

  /**
   * On Android when there are multiple pointers on the screen pan gestures most often just consider
   * the last placed pointer. The behaviour on iOS is quite different where the x and y component
   * of the pan pointer is calculated as an average out of all the pointers placed on the screen.
   */
  private static float getLastPointerX(MotionEvent event) {
    float offset = event.getRawX() - event.getX();
    int last = event.getActionMasked() == MotionEvent.ACTION_POINTER_UP ? 2 : 1;
    return event.getX(event.getPointerCount() - last) + offset;
  }

  private static float getLastPointerY(MotionEvent event) {
    float offset = event.getRawY() - event.getY();
    int last = event.getActionMasked() == MotionEvent.ACTION_POINTER_UP ? 2 : 1;
    return event.getY(event.getPointerCount() - last) + offset;
  }

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

  public PanGestureHandler setMinPointers(int minPointers) {
    mMinPointers = minPointers;
    return this;
  }

  public PanGestureHandler setMaxPointers(int maxPointers) {
    mMaxPointers = maxPointers;
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
    int action = event.getActionMasked();

    if (action == MotionEvent.ACTION_POINTER_UP || action == MotionEvent.ACTION_POINTER_DOWN) {
      // update offset if new pointer gets added or removed
      mOffsetX += mLastX - mStartX;
      mOffsetY += mLastY - mStartY;

      // reset starting point
      mLastX = getLastPointerX(event);
      mLastY = getLastPointerY(event);
      mStartX = mLastX;
      mStartY = mLastY;
    } else {
      mLastX = getLastPointerX(event);
      mLastY = getLastPointerY(event);
    }

    if (state == STATE_UNDETERMINED && event.getPointerCount() >= mMinPointers) {
      mStartX = mLastX;
      mStartY = mLastY;
      mOffsetX = 0;
      mOffsetY = 0;
      mVelocityTracker = VelocityTracker.obtain();
      mVelocityTracker.addMovement(event);
      begin();
    } else if (mVelocityTracker != null) {
      mVelocityTracker.addMovement(event);
      mVelocityTracker.computeCurrentVelocity(1);
      mLastVelocityX = mVelocityTracker.getXVelocity();
      mLastVelocityY = mVelocityTracker.getYVelocity();
    }

    if (action == MotionEvent.ACTION_UP) {
      if (state == STATE_ACTIVE) {
        end();
      } else {
        fail();
      }
    } else if ((action == MotionEvent.ACTION_POINTER_UP || action == MotionEvent.ACTION_POINTER_DOWN)
            && (event.getPointerCount() < mMinPointers || event.getPointerCount() > mMaxPointers)) {
      if (state == STATE_ACTIVE) {
        cancel();
      } else {
        fail();
      }
    } else if (state == STATE_BEGAN) {
      float dx = Math.abs(mStartX - mLastX + mOffsetX);
      float dy = Math.abs(mStartY - mLastY + mOffsetY);
      float distSq = dx * dx + dy * dy;
      float velocitySq = mLastVelocityX * mLastVelocityX + mLastVelocityY * mLastVelocityY;
      if (velocitySq < mMaxVelocitySq &&
              (distSq > mMinDistSq || dx > mMinDeltaX || dy > mMinDeltaY)) {
        activate();
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
    return mLastX - mStartX + mOffsetX;
  }

  public float getTranslationY() {
    return mLastY - mStartY + mOffsetY;
  }

  public float getVelocityX() {
    return mLastVelocityX;
  }

  public float getVelocityY() {
    return mLastVelocityY;
  }
}
