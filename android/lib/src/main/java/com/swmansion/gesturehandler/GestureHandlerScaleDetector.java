package com.swmansion.gesturehandler;

import android.content.Context;
import android.util.DisplayMetrics;
import android.view.MotionEvent;
import android.view.ViewConfiguration;

public class GestureHandlerScaleDetector {
  private static final String TAG = "GestureHandlerScaleDetector";

  public interface OnScaleGestureListener {
    public boolean onScale(GestureHandlerScaleDetector detector);
    public boolean onScaleBegin(GestureHandlerScaleDetector detector);
    public void onScaleEnd(GestureHandlerScaleDetector detector);
  }
  private static final float PRESSURE_THRESHOLD = 0.67f;
  private final Context mContext;
  private final OnScaleGestureListener mListener;
  private boolean mGestureInProgress;
  private GestureHandlerMotionEventAdapter mPrevEvent;
  private GestureHandlerMotionEventAdapter mCurrEvent;
  private float mFocusX;
  private float mFocusY;
  private float mPrevFingerDiffX;
  private float mPrevFingerDiffY;
  private float mCurrFingerDiffX;
  private float mCurrFingerDiffY;
  private float mCurrLen;
  private float mPrevLen;
  private float mScaleFactor;
  private float mCurrPressure;
  private float mPrevPressure;
  private long mTimeDelta;
  private final float mEdgeSlop;
  private float mRightSlopEdge;
  private float mBottomSlopEdge;
  private boolean mSloppyGesture;
  private boolean mInvalidGesture;
  // Pointer IDs currently responsible for the two fingers controlling the gesture
  private int mActiveId0;
  private int mActiveId1;
  private boolean mActive0MostRecent;


  public GestureHandlerScaleDetector(Context context, OnScaleGestureListener listener) {
    ViewConfiguration config = ViewConfiguration.get(context);
    mContext = context;
    mListener = listener;
    mEdgeSlop = config.getScaledEdgeSlop();
  }
  public boolean onTouchEvent(GestureHandlerMotionEventAdapter event) {
    final int action = event.getActionMasked();
    if (action == MotionEvent.ACTION_DOWN) {
      reset(); // Start fresh
    }
    boolean handled = true;
    if (mInvalidGesture) {
      handled = false;
    } else if (!mGestureInProgress) {
      switch (action) {
        case MotionEvent.ACTION_DOWN: {
          mActiveId0 = event.getFirstPoinerId();
          mActive0MostRecent = true;
        }
        break;
        case MotionEvent.ACTION_UP:
          reset();
          break;
        case MotionEvent.ACTION_POINTER_DOWN: {
          // We have a new multi-finger gesture
          // as orientation can change, query the metrics in touch down
          DisplayMetrics metrics = mContext.getResources().getDisplayMetrics();
          mRightSlopEdge = metrics.widthPixels - mEdgeSlop;
          mBottomSlopEdge = metrics.heightPixels - mEdgeSlop;
          if (mPrevEvent != null) mPrevEvent.recycle();
          mPrevEvent = GestureHandlerMotionEventAdapter.obtain(event);
          mTimeDelta = 0;
          int index1 = event.getActionIndex();
          int index0 = event.findPointerIndex(mActiveId0);
          mActiveId1 = event.getPointerId(index1);
          if (index0 < 0 || index0 == index1) {
            // Probably someone sending us a broken event stream.
            index0 = findNewActiveIndex(event, index0 == index1 ? -1 : mActiveId1, index0);
            mActiveId0 = event.getPointerId(index0);
          }
          mActive0MostRecent = false;
          setContext(event);
          // Check if we have a sloppy gesture. If so, delay
          // the beginning of the gesture until we're sure that's
          // what the user wanted. Sloppy gestures can happen if the
          // edge of the user's hand is touching the screen, for example.
          final float edgeSlop = mEdgeSlop;
          final float rightSlop = mRightSlopEdge;
          final float bottomSlop = mBottomSlopEdge;
          float x0 = getRawX(event, index0);
          float y0 = getRawY(event, index0);
          float x1 = getRawX(event, index1);
          float y1 = getRawY(event, index1);
          boolean p0sloppy = x0 < edgeSlop || y0 < edgeSlop
                  || x0 > rightSlop || y0 > bottomSlop;
          boolean p1sloppy = x1 < edgeSlop || y1 < edgeSlop
                  || x1 > rightSlop || y1 > bottomSlop;
          if (p0sloppy && p1sloppy) {
            mFocusX = -1;
            mFocusY = -1;
            mSloppyGesture = true;
          } else if (p0sloppy) {
            mFocusX = event.getX(index1);
            mFocusY = event.getY(index1);
            mSloppyGesture = true;
          } else if (p1sloppy) {
            mFocusX = event.getX(index0);
            mFocusY = event.getY(index0);
            mSloppyGesture = true;
          } else {
            mSloppyGesture = false;
            mGestureInProgress = mListener.onScaleBegin(this);
          }
        }
        break;
        case MotionEvent.ACTION_MOVE:
          if (mSloppyGesture) {
            // Initiate sloppy gestures if we've moved outside of the slop area.
            final float edgeSlop = mEdgeSlop;
            final float rightSlop = mRightSlopEdge;
            final float bottomSlop = mBottomSlopEdge;
            int index0 = event.findPointerIndex(mActiveId0);
            int index1 = event.findPointerIndex(mActiveId1);
            float x0 = getRawX(event, index0);
            float y0 = getRawY(event, index0);
            float x1 = getRawX(event, index1);
            float y1 = getRawY(event, index1);
            boolean p0sloppy = x0 < edgeSlop || y0 < edgeSlop
                    || x0 > rightSlop || y0 > bottomSlop;
            boolean p1sloppy = x1 < edgeSlop || y1 < edgeSlop
                    || x1 > rightSlop || y1 > bottomSlop;
            if (p0sloppy) {
              // Do we have a different pointer that isn't sloppy?
              int index = findNewActiveIndex(event, mActiveId1, index0);
              if (index >= 0) {
                index0 = index;
                mActiveId0 = event.getPointerId(index);
                x0 = getRawX(event, index);
                y0 = getRawY(event, index);
                p0sloppy = false;
              }
            }
            if (p1sloppy) {
              // Do we have a different pointer that isn't sloppy?
              int index = findNewActiveIndex(event, mActiveId0, index1);
              if (index >= 0) {
                index1 = index;
                mActiveId1 = event.getPointerId(index);
                x1 = getRawX(event, index);
                y1 = getRawY(event, index);
                p1sloppy = false;
              }
            }
            if(p0sloppy && p1sloppy) {
              mFocusX = -1;
              mFocusY = -1;
            } else if (p0sloppy) {
              mFocusX = event.getX(index1);
              mFocusY = event.getY(index1);
            } else if (p1sloppy) {
              mFocusX = event.getX(index0);
              mFocusY = event.getY(index0);
            } else {
              mSloppyGesture = false;
              mGestureInProgress = mListener.onScaleBegin(this);
            }
          }
          break;
        case MotionEvent.ACTION_POINTER_UP:
          if (mSloppyGesture) {
            final int pointerCount = event.getMotionEventPointerCount();
            final int actionIndex = event.getActionIndex();
            final int actionId = event.getPointerId(actionIndex);
            if (pointerCount > 2) {
              if (actionId == mActiveId0) {
                final int newIndex = findNewActiveIndex(event, mActiveId1, actionIndex);
                if (newIndex >= 0) mActiveId0 = event.getPointerId(newIndex);
              } else if (actionId == mActiveId1) {
                final int newIndex = findNewActiveIndex(event, mActiveId0, actionIndex);
                if (newIndex >= 0) mActiveId1 = event.getPointerId(newIndex);
              }
            } else {
              // Set focus point to the remaining finger
              final int index = event.findPointerIndex(actionId == mActiveId0 ?
                      mActiveId1 : mActiveId0);
              if (index < 0) {
                mInvalidGesture = true;
                if (mGestureInProgress) {
                  mListener.onScaleEnd(this);
                }
                return false;
              }
              mActiveId0 = event.getPointerId(index);
              mActive0MostRecent = true;
              mActiveId1 = -1;
              mFocusX = event.getX(index);
              mFocusY = event.getY(index);
            }
          }
          break;
      }
    } else {
      // Transform gesture in progress - attempt to handle it
      switch (action) {
        case MotionEvent.ACTION_POINTER_DOWN: {
          // End the old gesture and begin a new one with the most recent two fingers.
          mListener.onScaleEnd(this);
          final int oldActive0 = mActiveId0;
          final int oldActive1 = mActiveId1;
          reset();
          mPrevEvent = GestureHandlerMotionEventAdapter.obtain(event);
          mActiveId0 = mActive0MostRecent ? oldActive0 : oldActive1;
          mActiveId1 = event.getPointerId(event.getActionIndex());
          mActive0MostRecent = false;
          int index0 = event.findPointerIndex(mActiveId0);
          if (index0 < 0 || mActiveId0 == mActiveId1) {
            // Probably someone sending us a broken event stream.
            index0 = findNewActiveIndex(event,
                    mActiveId0 == mActiveId1 ? -1 : mActiveId1, index0);
            mActiveId0 = event.getPointerId(index0);
          }
          setContext(event);
          mGestureInProgress = mListener.onScaleBegin(this);
        }
        break;
        case MotionEvent.ACTION_POINTER_UP: {
          final int pointerCount = event.getMotionEventPointerCount();
          final int actionIndex = event.getActionIndex();
          final int actionId = event.getPointerId(actionIndex);
          boolean gestureEnded = false;
          if (pointerCount > 2) {
            if (actionId == mActiveId0) {
              final int newIndex = findNewActiveIndex(event, mActiveId1, actionIndex);
              if (newIndex >= 0) {
                mListener.onScaleEnd(this);
                mActiveId0 = event.getPointerId(newIndex);
                mActive0MostRecent = true;
                mPrevEvent = GestureHandlerMotionEventAdapter.obtain(event);
                setContext(event);
                mGestureInProgress = mListener.onScaleBegin(this);
              } else {
                gestureEnded = true;
              }
            } else if (actionId == mActiveId1) {
              final int newIndex = findNewActiveIndex(event, mActiveId0, actionIndex);
              if (newIndex >= 0) {
                mListener.onScaleEnd(this);
                mActiveId1 = event.getPointerId(newIndex);
                mActive0MostRecent = false;
                mPrevEvent = GestureHandlerMotionEventAdapter.obtain(event);
                setContext(event);
                mGestureInProgress = mListener.onScaleBegin(this);
              } else {
                gestureEnded = true;
              }
            }
            mPrevEvent.recycle();
            mPrevEvent = GestureHandlerMotionEventAdapter.obtain(event);
            setContext(event);
          } else {
            gestureEnded = true;
          }
          if (gestureEnded) {
            // Gesture ended
            setContext(event);
            // Set focus point to the remaining finger
            final int activeId = actionId == mActiveId0 ? mActiveId1 : mActiveId0;
            final int index = event.findPointerIndex(activeId);
            mFocusX = event.getX(index);
            mFocusY = event.getY(index);
            mListener.onScaleEnd(this);
            reset();
            mActiveId0 = activeId;
            mActive0MostRecent = true;
          }
        }
        break;
        case MotionEvent.ACTION_CANCEL:
          mListener.onScaleEnd(this);
          reset();
          break;
        case MotionEvent.ACTION_UP:
          reset();
          break;
        case MotionEvent.ACTION_MOVE: {
          setContext(event);
          // Only accept the event if our relative pressure is within
          // a certain limit - this can help filter shaky data as a
          // finger is lifted.
          if (mCurrPressure / mPrevPressure > PRESSURE_THRESHOLD) {
            final boolean updatePrevious = mListener.onScale(this);
            if (updatePrevious) {
              mPrevEvent.recycle();
              mPrevEvent = GestureHandlerMotionEventAdapter.obtain(event);
            }
          }
        }
        break;
      }
    }
    return handled;
  }
  private int findNewActiveIndex(GestureHandlerMotionEventAdapter ev, int otherActiveId, int oldIndex) {
    final int pointerCount = ev.getMotionEventPointerCount();
    // It's ok if this isn't found and returns -1, it simply won't match.
    final int otherActiveIndex = ev.findPointerIndex(otherActiveId);
    int newActiveIndex = -1;
    // Pick a new id and update tracking state. Only pick pointers not on the slop edges.
    for (int i = 0; i < pointerCount; i++) {
      if (!ev.containsIndexOfMotionEvent(i))
        continue;
      if (i != oldIndex && i != otherActiveIndex) {
        final float edgeSlop = mEdgeSlop;
        final float rightSlop = mRightSlopEdge;
        final float bottomSlop = mBottomSlopEdge;
        float x = getRawX(ev, i);
        float y = getRawY(ev, i);
        if (x >= edgeSlop && y >= edgeSlop && x <= rightSlop && y <= bottomSlop) {
          newActiveIndex = i;
          break;
        }
      }
    }
    return newActiveIndex;
  }

  private static float getRawX(GestureHandlerMotionEventAdapter event, int pointerIndex) {
    if (pointerIndex < 0) return Float.MIN_VALUE;
    if (pointerIndex == 0) return event.getRawX();
    float offset = event.getRawX() - event.getX();
    return event.getX(pointerIndex) + offset;
  }

  private static float getRawY(GestureHandlerMotionEventAdapter event, int pointerIndex) {
    if (pointerIndex < 0) return Float.MIN_VALUE;
    if (pointerIndex == 0) return event.getRawY();
    float offset = event.getRawY() - event.getY();
    return event.getY(pointerIndex) + offset;
  }
  private void setContext(GestureHandlerMotionEventAdapter curr) {
    if (mCurrEvent != null) {
      mCurrEvent.recycle();
    }
    mCurrEvent = GestureHandlerMotionEventAdapter.obtain(curr);
    mCurrLen = -1;
    mPrevLen = -1;
    mScaleFactor = -1;
    final GestureHandlerMotionEventAdapter prev = mPrevEvent;
    final int prevIndex0 = prev.findPointerIndex(mActiveId0);
    final int prevIndex1 = prev.findPointerIndex(mActiveId1);
    final int currIndex0 = curr.findPointerIndex(mActiveId0);
    final int currIndex1 = curr.findPointerIndex(mActiveId1);
    if (prevIndex0 < 0 || prevIndex1 < 0 || currIndex0 < 0 || currIndex1 < 0) {
      mInvalidGesture = true;
      if (mGestureInProgress) {
        mListener.onScaleEnd(this);
      }
      return;
    }
    final float px0 = prev.getX(prevIndex0);
    final float py0 = prev.getY(prevIndex0);
    final float px1 = prev.getX(prevIndex1);
    final float py1 = prev.getY(prevIndex1);
    final float cx0 = curr.getX(currIndex0);
    final float cy0 = curr.getY(currIndex0);
    final float cx1 = curr.getX(currIndex1);
    final float cy1 = curr.getY(currIndex1);
    final float pvx = px1 - px0;
    final float pvy = py1 - py0;
    final float cvx = cx1 - cx0;
    final float cvy = cy1 - cy0;
    mPrevFingerDiffX = pvx;
    mPrevFingerDiffY = pvy;
    mCurrFingerDiffX = cvx;
    mCurrFingerDiffY = cvy;
    mFocusX = cx0 + cvx * 0.5f;
    mFocusY = cy0 + cvy * 0.5f;
    mTimeDelta = curr.getEventTime() - prev.getEventTime();
    mCurrPressure = curr.getPressure(currIndex0) + curr.getPressure(currIndex1);
    mPrevPressure = prev.getPressure(prevIndex0) + prev.getPressure(prevIndex1);
  }
  private void reset() {
    if (mPrevEvent != null) {
      mPrevEvent.recycle();
      mPrevEvent = null;
    }
    if (mCurrEvent != null) {
      mCurrEvent.recycle();
      mCurrEvent = null;
    }
    mSloppyGesture = false;
    mGestureInProgress = false;
    mActiveId0 = -1;
    mActiveId1 = -1;
    mInvalidGesture = false;
  }
  public float getFocusX() {
    return mFocusX;
  }

  public float getFocusY() {
    return mFocusY;
  }

  public float getCurrentSpan() {
    if (mCurrLen == -1) {
      final float cvx = mCurrFingerDiffX;
      final float cvy = mCurrFingerDiffY;
      mCurrLen = (float)Math.sqrt(cvx*cvx + cvy*cvy);
    }
    return mCurrLen;
  }

  public float getPreviousSpan() {
    if (mPrevLen == -1) {
      final float pvx = mPrevFingerDiffX;
      final float pvy = mPrevFingerDiffY;
      mPrevLen = (float)Math.sqrt(pvx*pvx + pvy*pvy);
    }
    return mPrevLen;
  }

  public float getScaleFactor() {
    if (mScaleFactor == -1) {
      mScaleFactor = getCurrentSpan() / getPreviousSpan();
    }
    return mScaleFactor;
  }

  public long getTimeDelta() {
    return mTimeDelta;
  }
}