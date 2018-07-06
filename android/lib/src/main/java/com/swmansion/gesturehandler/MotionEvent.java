package com.swmansion.gesturehandler;

import android.view.VelocityTracker;

import com.facebook.react.bridge.JSApplicationIllegalArgumentException;

import java.util.Arrays;

public class MotionEvent {
  public static final int ACTION_DOWN = android.view.MotionEvent.ACTION_DOWN;
  public static final int ACTION_UP = android.view.MotionEvent.ACTION_UP;
  public static final int ACTION_POINTER_DOWN = android.view.MotionEvent.ACTION_POINTER_DOWN;
  public static final int ACTION_POINTER_UP = android.view.MotionEvent.ACTION_POINTER_UP;
  public static final int ACTION_MOVE = android.view.MotionEvent.ACTION_MOVE;
  public static final int INVALID_POINTER_ID = android.view.MotionEvent.INVALID_POINTER_ID;
  public static final int ACTION_CANCEL = android.view.MotionEvent.ACTION_CANCEL;

  private static int MAX_POINTERS_COUNT = 10;

  private final boolean[] mActivePointers;
  private int mActivePointersCount = 0;
  private android.view.MotionEvent mEvent;
  private VelocityTracker mVelocityTracker;
  private int mFirstPointerId = -1;


  public MotionEvent() {
    mActivePointers = new boolean[MAX_POINTERS_COUNT];
    activePointersClear();
  }

  private MotionEvent(MotionEvent other) {
    mEvent = android.view.MotionEvent.obtain(other.mEvent);
    mActivePointers = Arrays.copyOf(other.mActivePointers, MAX_POINTERS_COUNT);
  }

  static MotionEvent obtain(MotionEvent other) {
    return new MotionEvent(other);
  }

  private void activePointersClear() {
    Arrays.fill(mActivePointers, false);
  }

  private int getFirstActiveIndex() {
    for(int i = 0; i < mEvent.getPointerCount(); i++) {
      if (mActivePointers[mEvent.getPointerId(i)])
        return i;
    }
    return -1;
  }

  public void initVelocityTracker() {
    mVelocityTracker = VelocityTracker.obtain();
    addVelocityMovement();
  }

  public boolean hasInitializedVelocityTracker() {
    return mVelocityTracker != null;
  }

  public boolean hasCommonPointers(MotionEvent other) {
    for (int i = 0; i < MAX_POINTERS_COUNT; i++) {
      if (mActivePointers[i] && other.mActivePointers[i]) {
        return true;
      }
    }
    return false;
  }

  /**
   * This method adds movement to {@class VelocityTracker} first resetting offset of the event so
   * that the velocity is calculated based on the absolute position of touch pointers. This is
   * because if the underlying view moves along with the finger using relative x/y coords yields
   * incorrect results.
   */
  private void addVelocityMovement() {
    if (mVelocityTracker == null) {
      return;
    }
    float xOffset = getXOffset();
    float yOffset = getYOffset();
    mEvent.offsetLocation(xOffset, yOffset);
    mVelocityTracker.addMovement(mEvent);
    mEvent.offsetLocation(-xOffset, -yOffset);
  }

  public int getActionMasked() {
    int action = mEvent.getActionMasked();

    if (mActivePointersCount == 0) {
      throw new JSApplicationIllegalArgumentException("Asked for empty event");
    }

    if (action == android.view.MotionEvent.ACTION_POINTER_DOWN && mActivePointersCount == 1) {
      // handle when many fingers on screen but only one just touched the area
      return android.view.MotionEvent.ACTION_DOWN;
    }

    if (action == ACTION_POINTER_UP && (mActivePointersCount == 1)) {
      // handle when many fingers on screen but the one of active was removed from area
      return ACTION_UP;
    }

    return mEvent.getActionMasked();
  }

  public int getPointerCount() {
    return mActivePointersCount;
  }

  public int getMotionEventPointerCount() {
    return mEvent.getPointerCount();
  }

  public boolean containsIndexOfMotionEvent(int index) {
    return mActivePointers[mEvent.getPointerId(index)];
  }

  public float getX() {
    return mEvent.getX(getFirstActiveIndex());
  }

  public float getY() {
    return mEvent.getY(getFirstActiveIndex());
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

  public int getFirstPointerId() {
    return mFirstPointerId;
  }

  public float getY(int pointerIndex) {
    return mEvent.getY(pointerIndex);
  }

  public float getX(int pointerIndex) {
    return mEvent.getX(pointerIndex);
  }

  public android.view.MotionEvent getRawEvent() {
    return mEvent;
  }

  public float getXVelocity() {
    float sum = 0;
    for (int i = 0; i < MAX_POINTERS_COUNT; i++) {
      if (!mActivePointers[i]) {
        continue;
      }
      sum += mVelocityTracker.getXVelocity(i);
    }
    return sum / mActivePointersCount;
  }

  public float getYVelocity() {
    float sum = 0;
    for (int i = 0; i < MAX_POINTERS_COUNT; i++) {
      if (!mActivePointers[i]) {
        continue;
      }
      sum += mVelocityTracker.getYVelocity(i);
    }
    return sum / mActivePointersCount;
  }

  public void reset() {
    activePointersClear();
    mActivePointersCount = 0;
    mFirstPointerId = -1;
    if (mVelocityTracker != null) {
      mVelocityTracker.recycle();
      mVelocityTracker = null;
    }
  }


  public boolean wrap(android.view.MotionEvent event) {
    int action = event.getActionMasked();
    if (action == ACTION_POINTER_DOWN || action == ACTION_DOWN) {
      int index = event.getActionIndex();
      if (mActivePointersCount == 0) {
        mFirstPointerId = event.getPointerId(index);
      }
      mActivePointers[event.getPointerId(index)] = true;
      mActivePointersCount++;
    }

    mEvent = event;

    if (mVelocityTracker != null) {
      addVelocityMovement();
      mVelocityTracker.computeCurrentVelocity(1000);
    }

    if ((action == ACTION_UP || action == ACTION_POINTER_UP) &&
            !mActivePointers[mEvent.getPointerId(getActionIndex())]) {
      return false; // not to be handled
    }
    return true;
  }

  public void unwrap() {
    int action = mEvent.getActionMasked();
    int id = mEvent.getPointerId(mEvent.getActionIndex());
    if (action == ACTION_POINTER_UP || action == ACTION_UP) {
      mActivePointers[id] = false;
      mActivePointersCount--;
      if (mActivePointersCount == 0) {
        mFirstPointerId = -1;
      }
    }
    mEvent = null;
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

  public float getXOffset() {
    return mEvent.getRawX() - mEvent.getX();
  }

  public float getYOffset() {
    return mEvent.getRawY() - mEvent.getY();
  }

  public float getLastPointerX(boolean averageTouches) {
    float offset = getXOffset();
    int excludeIndex = getActionMasked() == ACTION_POINTER_UP ?
            getActionIndex() : -1;

    if (averageTouches) {
      float sum = 0f;
      int count = 0;
      for (int i = 0, size = getMotionEventPointerCount(); i < size; i++) {
        if (i != excludeIndex && containsIndexOfMotionEvent(i)) {
          sum += getX(i) + offset;
          count++;
        }
      }
      return sum / count;
    } else {
      int lastPointerIdx = getMotionEventPointerCount() - 1;
      while (lastPointerIdx == excludeIndex || !containsIndexOfMotionEvent(lastPointerIdx)) {
        lastPointerIdx--;
      }
      return getX(lastPointerIdx) + offset;
    }
  }

  public float getLastPointerY(boolean averageTouches) {
    float offset = getYOffset();
    int excludeIndex = getActionMasked() == ACTION_POINTER_UP ?
            getActionIndex() : -1;

    if (averageTouches) {
      float sum = 0f;
      int count = 0;
      for (int i = 0, size = getMotionEventPointerCount(); i < size; i++) {
        if (i != excludeIndex && containsIndexOfMotionEvent(i)) {
          sum += getY(i) + offset;
          count++;
        }
      }
      return sum / count;
    } else {
      int lastPointerIdx = getMotionEventPointerCount() - 1;
      while (lastPointerIdx == excludeIndex || !containsIndexOfMotionEvent(lastPointerIdx)) {
        lastPointerIdx--;
      }
      return getY(lastPointerIdx) + offset;
    }
  }
}
