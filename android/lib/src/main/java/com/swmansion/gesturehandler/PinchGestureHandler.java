package com.swmansion.gesturehandler;

import android.content.Context;
import android.view.MotionEvent;
import android.view.ScaleGestureDetector;
import android.view.ViewConfiguration;

public class PinchGestureHandler extends GestureHandler<PinchGestureHandler> {

  private ScaleGestureDetector mScaleGestureDetector;
  private double mLastScaleFactor;
  private double mLastVelocity;

  private float mStartingSpan;
  private float mSpanSlop;

  private float focalX = Float.NaN;
  private float focalY = Float.NaN;

  private ScaleGestureDetector.OnScaleGestureListener mGestureListener =
          new ScaleGestureDetector.OnScaleGestureListener() {

    @Override
    public boolean onScale(ScaleGestureDetector detector) {
      double prevScaleFactor = mLastScaleFactor;
      mLastScaleFactor *= detector.getScaleFactor();
      long delta = detector.getTimeDelta();
      if (delta > 0) {
        mLastVelocity = (mLastScaleFactor - prevScaleFactor) / delta;
      }
      if (Math.abs(mStartingSpan - detector.getCurrentSpan()) >= mSpanSlop
              && getState() == STATE_BEGAN) {
        activate();
      }
      return true;
    }

    @Override
    public boolean onScaleBegin(ScaleGestureDetector detector) {
      mStartingSpan = detector.getCurrentSpan();
      return true;
    }

    @Override
    public void onScaleEnd(ScaleGestureDetector detector) {
      // ScaleGestureDetector thinks that when fingers are 27mm away that's a sufficiently good
      // reason to trigger this method giving us no other choice but to ignore it completely.
    }
  };

  public PinchGestureHandler() {
    setShouldCancelWhenOutside(false);
  }

  @Override
  protected void onHandle(MotionEvent event) {
    int state = getState();
    if (state == STATE_UNDETERMINED) {
      Context context = getView().getContext();
      mLastVelocity = 0f;
      mLastScaleFactor = 1f;
      mScaleGestureDetector = new ScaleGestureDetector(context, mGestureListener);
      ViewConfiguration configuration = ViewConfiguration.get(context);
      mSpanSlop = configuration.getScaledTouchSlop();
    }

    int activePointers = event.getPointerCount();
    if (event.getActionMasked() == MotionEvent.ACTION_POINTER_UP) {
      activePointers -= 1;
    }

    if (
      mScaleGestureDetector != null &&
      (state != STATE_ACTIVE || activePointers >= 2)
    ) {
      this.focalX = mScaleGestureDetector.getFocusX();
      this.focalY = mScaleGestureDetector.getFocusY();
    }

    if (state == STATE_UNDETERMINED) {
      begin();
    }

    if (mScaleGestureDetector != null) {
      mScaleGestureDetector.onTouchEvent(event);
    }

    if (state == STATE_ACTIVE && activePointers < 2) {
      end();
    } else if (event.getActionMasked() == MotionEvent.ACTION_UP) {
      fail();
    }
  }

  @Override
  protected void onReset() {
    mScaleGestureDetector = null;
    mLastVelocity = 0f;
    mLastScaleFactor = 1f;
  }

  public double getScale() {
    return mLastScaleFactor;
  }

  public double getVelocity() {
    return mLastVelocity;
  }

  public float getFocalPointX() {
    return this.focalX;
  }

  public float getFocalPointY() {
    return this.focalY;
  }
}
