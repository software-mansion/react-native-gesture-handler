package com.swmansion.gesturehandler;

import android.content.Context;
import android.view.ViewConfiguration;

public class PinchGestureHandler extends GestureHandler<PinchGestureHandler> {

  private GestureHandlerScaleDetector mScaleDetector;
  private double mLastScaleFactor;
  private double mLastVelocity;

  private float mStartingSpan;
  private float mSpanSlop;

  private GestureHandlerScaleDetector.OnScaleGestureListener mGestureListener =
          new GestureHandlerScaleDetector.OnScaleGestureListener() {

    @Override
    public boolean onScale(GestureHandlerScaleDetector detector) {
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
    public boolean onScaleBegin(GestureHandlerScaleDetector detector) {
      mStartingSpan = detector.getCurrentSpan();
      return true;
    }

    @Override
    public void onScaleEnd(GestureHandlerScaleDetector detector) {
      // GestureHandlerScaleDetector thinks that when fingers are 27mm away that's a sufficiently good
      // reason to trigger this method giving us no other choice but to ignore it completely.
    }
  };

  public PinchGestureHandler() {
    setShouldCancelWhenOutside(false);
  }

  @Override
  protected void onHandle(MotionEvent event) {
    if (getState() == STATE_UNDETERMINED) {
      Context context = getView().getContext();
      mLastVelocity = 0f;
      mLastScaleFactor = 1f;
      mScaleDetector = new GestureHandlerScaleDetector(context, mGestureListener);
      ViewConfiguration configuration = ViewConfiguration.get(context);
      mSpanSlop = configuration.getScaledTouchSlop();

      begin();
    }

    if (mScaleDetector != null) {
      mScaleDetector.onTouchEvent(event);
    }

    int activePointers = event.getPointerCount();
    if (event.getActionMasked() == MotionEvent.ACTION_POINTER_UP) {
      activePointers -= 1;
    }

    if (getState() == STATE_ACTIVE && activePointers < 2) {
      end();
    } else if (event.getActionMasked() == MotionEvent.ACTION_UP) {
      fail();
    }
  }

  @Override
  protected void onReset() {
    mScaleDetector = null;
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
    if (mScaleDetector == null) {
      return Float.NaN;
    }
    return mScaleDetector.getFocusX();
  }

  public float getFocalPointY() {
    if (mScaleDetector == null) {
      return Float.NaN;
    }
    return mScaleDetector.getFocusY();
  }
}
