package com.swmansion.gesturehandler;

import android.view.MotionEvent;

public class RotationGestureDetector {

  public interface OnRotationGestureListener {

    boolean onRotation(RotationGestureDetector detector);

    boolean onRotationBegin(RotationGestureDetector detector);

    void onRotationEnd(RotationGestureDetector detector);
  }

  private long mCurrTime;
  private long mPrevTime;
  private double mPrevAngle;
  private double mAngleDiff;

  private boolean mInProgress;

  private int mPointerIndices[] = new int[2];

  private OnRotationGestureListener mListener;

  public RotationGestureDetector(OnRotationGestureListener listener) {
    mListener = listener;
  }

  private float getRawX(MotionEvent event, int index) {
    float offset = event.getX() - event.getRawX();
    return event.getX(mPointerIndices[index]) + offset;
  }

  private float getRawY(MotionEvent event, int index) {
    float offset = event.getY() - event.getRawY();
    return event.getY(mPointerIndices[index]) + offset;
  }

  private void updateCurrent(MotionEvent event) {
    mPrevTime = mCurrTime;
    mCurrTime = event.getEventTime();

    float vectorX = getRawX(event, 1) - getRawX(event, 0);
    float vectorY = getRawY(event, 1) - getRawY(event, 0);

    // Angle diff should be positive when rotating in clockwise direction
    double angle = -Math.atan2(vectorY, vectorX);

    if (Double.isNaN(mPrevAngle)) {
      mAngleDiff = 0.;
    } else {
      mAngleDiff = mPrevAngle - angle;
    }
    mPrevAngle = angle;

    if (mAngleDiff > Math.PI / 2) {
      mAngleDiff -= Math.PI;
    } else if (mAngleDiff < -Math.PI / 2) {
      mAngleDiff += Math.PI;
    }
  }

  private void finish() {
    if (mInProgress) {
      mInProgress = false;
      if (mListener != null) {
        mListener.onRotationEnd(this);
      }
    }
  }

  public boolean onTouchEvent(MotionEvent event) {
    switch (event.getActionMasked()) {

      case MotionEvent.ACTION_DOWN:
        mInProgress = false;
        mPointerIndices[0] = event.getPointerId(event.getActionIndex());
        mPointerIndices[1] = MotionEvent.INVALID_POINTER_ID;
        break;

      case MotionEvent.ACTION_POINTER_DOWN:
        if (!mInProgress) {
          mPointerIndices[1] = event.getPointerId(event.getActionIndex());
          mInProgress = true;
          mPrevTime = event.getEventTime();
          mPrevAngle = Double.NaN;
          updateCurrent(event);
          if (mListener != null) {
            mListener.onRotationBegin(this);
          }
        }
        break;

      case MotionEvent.ACTION_MOVE:
        if (mInProgress) {
          updateCurrent(event);
          if (mListener != null) {
            mListener.onRotation(this);
          }
        }
        break;

      case MotionEvent.ACTION_POINTER_UP:
        if (mInProgress) {
          int pointerIndex = event.getPointerId(event.getActionIndex());
          if (pointerIndex == mPointerIndices[0] || pointerIndex == mPointerIndices[1]) {
            // One of the key pointer has been lifted up, we have to end the gesture
            finish();
          }
        }
        break;

      case MotionEvent.ACTION_UP:
        finish();
        break;
    }
    return true;
  }

  /**
   * Returns rotation in radians since the previous rotation event.
   *
   * @return current rotation step in radians.
   */
  public double getRotation() {
    return mAngleDiff;
  }

  /**
   * Return the time difference in milliseconds between the previous
   * accepted rotation event and the current rotation event.
   *
   * @return Time difference since the last rotation event in milliseconds.
   */
  public long getTimeDelta() {
    return mCurrTime - mPrevTime;
  }
}
