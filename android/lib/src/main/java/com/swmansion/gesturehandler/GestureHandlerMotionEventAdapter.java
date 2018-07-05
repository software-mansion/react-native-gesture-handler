package com.swmansion.gesturehandler;

import android.view.MotionEvent;
import android.view.VelocityTracker;
import java.util.HashSet;
import java.util.Set;

public class GestureHandlerMotionEventAdapter {
  private final Set<Integer> mActivePointers;
  private final GestureHandler mHandler;
  private MotionEvent mEvent;
  private VelocityTracker mVelocityTracker;
  private int mFirstPointerId = -1;

  public GestureHandlerMotionEventAdapter(GestureHandler handler) {
    mHandler = handler;
    mActivePointers = new HashSet<>();
  }

  private GestureHandlerMotionEventAdapter(GestureHandlerMotionEventAdapter other) {
    mEvent = MotionEvent.obtain(other.mEvent);
    mActivePointers = other.mActivePointers;
    mHandler = other.mHandler;
  }

  static GestureHandlerMotionEventAdapter obtain(GestureHandlerMotionEventAdapter other) {
    return new GestureHandlerMotionEventAdapter(other);
  }

  public int getActionMasked() {
    int action = mEvent.getActionMasked();

    if (action == MotionEvent.ACTION_POINTER_DOWN && mActivePointers.size() == 1) {
      // handle when many fingers on screen but only one just touched the area
      return MotionEvent.ACTION_DOWN;
    }

    if (action == MotionEvent.ACTION_POINTER_UP && (mActivePointers.size() == 1 || mActivePointers.size() == 0)) {
      // handle when many fingers on screen but the one of active was removed from area
      return MotionEvent.ACTION_UP;
    }

    return mEvent.getActionMasked();
  }

  public int getPointerCount() {
    return mActivePointers.size();
  }

  public int getMotionEventPointerCount() {
    return mEvent.getPointerCount();
  }

  public boolean containsIndexOfMotionEvent(int index) {
    return mActivePointers.contains(mEvent.getPointerId(index));
  }

  public float getX() {
    return mEvent.getX();
  }

  public float getY() {
    return mEvent.getY();
  }

  public float getRawX() {
    return mEvent.getRawX();
  }

  public float getRawY() {
    return mEvent.getRawY();
  }

  public int getActionIndex() {
    return mEvent.getActionIndex();
  }

  public int getFirstPoinerId(){
    return mFirstPointerId;
  }

  public float getY(int pointerIndex) {
    return mEvent.getY(pointerIndex);
  }

  public float getX(int pointerIndex) {
    return mEvent.getX(pointerIndex);
  }

  public MotionEvent getRawEvent() {
    return mEvent;
  }

  public void setVelocityTracker(VelocityTracker velocityTracker) {
    mVelocityTracker = velocityTracker;
  }

  public float getXVelocity() {
    float sum = 0;
    for (int i : mActivePointers) {
      sum += mVelocityTracker.getXVelocity(i);
    }
    return sum / mActivePointers.size();
  }

  public float getYVelocity() {
    float sum = 0;
    for (int i : mActivePointers) {
      sum += mVelocityTracker.getYVelocity(i);
    }
    return sum / mActivePointers.size();
  }

  public void reset(){
    mActivePointers.clear();
    mFirstPointerId = -1;
  }


  public boolean updateMotionEventBeforeHandling(MotionEvent event) {
    int action = event.getActionMasked();
    if (action == MotionEvent.ACTION_POINTER_DOWN || action == MotionEvent.ACTION_DOWN) {
      int index = event.getActionIndex();
      if (mHandler.isWithinBounds(mHandler.getView(), event.getX(index), event.getY(index))) {
        if (mActivePointers.size() == 0 ) {
          mFirstPointerId = event.getPointerId(index);
        }
        mActivePointers.add(event.getPointerId(index));
      } else {
        return false;
      }
    }

    mEvent = event;
    if((action == MotionEvent.ACTION_UP || action == MotionEvent.ACTION_POINTER_UP) &&
            !mActivePointers.contains(mEvent.getPointerId(getActionIndex()))){
      return false; // not to be handled
    }
    return true;
  }

  public void updateMotionEventAfterHandling(MotionEvent event) {
    int action = event.getActionMasked();
    int id = event.getPointerId(event.getActionIndex());
    if (action == MotionEvent.ACTION_POINTER_UP || action == MotionEvent.ACTION_UP) {
      mActivePointers.remove(id);
      if (mActivePointers.size() == 0) {
        mFirstPointerId = -1;
      }
    }
  }

  public int getPointerId(int pointerIndex) {
    return mEvent.getPointerId(pointerIndex);
  }

  public long getEventTime() {
    return mEvent.getEventTime();
  }

  public int findPointerIndex(int pointerId) {
    return mEvent.findPointerIndex(pointerId);
  }

  public void recycle() {
    mEvent.recycle();
  }

  public float getPressure(int pointerIndex) {
    return mEvent.getPressure(pointerIndex);
  }
}
