package com.swmansion.gesturehandler;

import android.view.VelocityTracker;

import java.util.Arrays;

/**
 * This class acts as an adapter to the original {@link android.view.MotionEvent}.
 *
 * Due to the fact MotionEvent is final we cannot extend it directly. Instead we introduce a
 * separate class with a very similar (but limited) interface. That class is being used in all the
 * handlers.
 *
 * The idea behind this adapter class is so that we can filer out pointers that given gesture
 * handler is currently tracking. We override methods like {@link #getPointerCount()} to return only
 * the tracked count and also re-map pointer indices such that they start from 0.
 *
 * The purpose is to make it transparent to handler logic whether we use original or adapted version
 * of MotionEvent. And so that it does not need to control if POINTER_DOWN actually corresponds to
 * ACTION_DOWN as the newly added pointer is the first one being tracked by the handler. It also
 * makes it easy to adapt code from ScaleGestureDetector as it just rely on the same interface and
 * works with adapter MotionEvent with almost zero changes.
 *
 * An alternative solution we considered to doing this would be to call into MotionEvent.obtain for
 * each handler and pass filtered list of pointers there. We may still eventually adapt that approach
 * in the future. The main consideration being the fact that the event would need to be copied each
 * time for each gesture handler.
 */
public class MotionEvent {
  public static final int ACTION_DOWN = android.view.MotionEvent.ACTION_DOWN;
  public static final int ACTION_UP = android.view.MotionEvent.ACTION_UP;
  public static final int ACTION_POINTER_DOWN = android.view.MotionEvent.ACTION_POINTER_DOWN;
  public static final int ACTION_POINTER_UP = android.view.MotionEvent.ACTION_POINTER_UP;
  public static final int ACTION_MOVE = android.view.MotionEvent.ACTION_MOVE;
  public static final int INVALID_POINTER_ID = android.view.MotionEvent.INVALID_POINTER_ID;
  public static final int ACTION_CANCEL = android.view.MotionEvent.ACTION_CANCEL;

  private static int MAX_POINTERS_COUNT = 11;

  private final int[] mPointerIndices;
  private int mActionMasked;
  private int mPointersCount = 0;
  private int mActionIndex = -1;
  private android.view.MotionEvent mEvent;
  private VelocityTracker mVelocityTracker;


  public MotionEvent() {
    mPointerIndices = new int[MAX_POINTERS_COUNT];
  }

  private MotionEvent(MotionEvent other) {
    mEvent = android.view.MotionEvent.obtain(other.mEvent);
    mActionIndex = other.mActionIndex;
    mActionMasked = other.mActionMasked;
    mPointersCount = other.mPointersCount;
    mPointerIndices = Arrays.copyOf(other.mPointerIndices, MAX_POINTERS_COUNT);
  }

  static MotionEvent obtain(MotionEvent other) {
    return new MotionEvent(other);
  }

  public void trackVelocity() {
    mVelocityTracker = VelocityTracker.obtain();
    addVelocityMovement();
  }

  public boolean isTrackingVelocity() {
    return mVelocityTracker != null;
  }

  /**
   * This method adds movement to {@class VelocityTracker} first resetting offset of the event so
   * that the velocity is calculated based on the absolute position of touch pointers. This is
   * because if the underlying view moves along with the finger using relative x/y coords yields
   * incorrect results.
   */
  private void addVelocityMovement() {
    float xOffset = mEvent.getRawX() - mEvent.getX();
    float yOffset = mEvent.getRawY() - mEvent.getY();
    mEvent.offsetLocation(xOffset, yOffset);
    mVelocityTracker.addMovement(mEvent);
    mEvent.offsetLocation(-xOffset, -yOffset);
  }

  public int getActionMasked() {
    return mActionMasked;
  }

  public int getPointerCount() {
    return mPointersCount;
  }

  public float getX() {
    return mEvent.getX(mPointerIndices[0]);
  }

  public float getY() {
    return mEvent.getY(mPointerIndices[0]);
  }

  public float getRawX() {
    return getRawX(0);
  }

  public float getRawY() {
    return getRawY(0);
  }

  public float getRawX(int index) {
    float offset = mEvent.getRawX() - mEvent.getX();
    return mEvent.getX(mPointerIndices[index]) + offset;
  }

  public float getRawY(int index) {
    float offset = mEvent.getRawY() - mEvent.getY();
    return mEvent.getY(mPointerIndices[index]) + offset;
  }

  public int getActionIndex() {
    return mActionIndex;
  }

  public float getY(int pointerIndex) {
    return mEvent.getY(mPointerIndices[pointerIndex]);
  }

  public float getX(int pointerIndex) {
    return mEvent.getX(mPointerIndices[pointerIndex]);
  }

  public android.view.MotionEvent getRawEvent() {
    return mEvent;
  }

  public float getXVelocity() {
    float sum = 0;
    for (int i = 0; i < mPointersCount; i++) {
      sum += mVelocityTracker.getXVelocity(mEvent.getPointerId(mPointerIndices[i]));
    }
    return sum / mPointersCount;
  }

  public float getYVelocity() {
    float sum = 0;
    for (int i = 0; i < mPointersCount; i++) {
      sum += mVelocityTracker.getYVelocity(mEvent.getPointerId(mPointerIndices[i]));
    }
    return sum / mPointersCount;
  }

  public void reset() {
    if (mVelocityTracker != null) {
      mVelocityTracker.recycle();
      mVelocityTracker = null;
    }
    mEvent = null;
  }

  /**
   * Call this method to wrap motion event adapter to use newly provided motion event.
   *
   * This needs to be called before we attempt on calling any pointer related method such as
   * getPointersCount etc.
   */
  public void wrap(android.view.MotionEvent event, boolean[] trackedPointerIDs) {
    int action = event.getActionMasked();
    boolean pointerAction = action == ACTION_DOWN || action == ACTION_POINTER_DOWN
            || action == ACTION_UP || action == ACTION_POINTER_UP;
    int actionIndex = pointerAction ? event.getActionIndex() : -1;

    // Fill in pointerIndices array such that first mActivePointerCount items
    // contains original indices from mEvent that corresponds to the indices
    // of pointers activated for this adapter.
    mPointersCount = 0;
    mActionIndex = -1;
    for (int i = 0, size = event.getPointerCount(); i < size; i++) {
      int pointerId = event.getPointerId(i);
      if (trackedPointerIDs[pointerId]) {
        if (i == actionIndex) {
          // assign mActionIndex such that the record in mPointerIndices maps to
          // the original's event action index
          mActionIndex = mPointersCount;
        }
        mPointerIndices[mPointersCount++] = i;
      }
    }

    if (pointerAction) {
      if (!trackedPointerIDs[event.getPointerId(actionIndex)]) {
        // pointer which got added / removed is not being tracked by handler corresponding
        // to this event adapter. We change action to ACTION_MOVE such that the handler still
        // can read other pointer movements
        action = ACTION_MOVE;
      }
    }

    // assign action that adapter will provide when asked
    if (action == ACTION_POINTER_DOWN || action == ACTION_DOWN) {
      mActionMasked = mPointersCount == 1 ? ACTION_DOWN : ACTION_POINTER_DOWN;
    } else if (action == ACTION_UP || action == ACTION_POINTER_UP) {
      mActionMasked = mPointersCount == 1 ? ACTION_UP : ACTION_POINTER_UP;
    } else if (action == ACTION_CANCEL) {
      mActionMasked = ACTION_CANCEL;
    } else {
      mActionMasked = ACTION_MOVE;
    }

    mEvent = event;

    if (mVelocityTracker != null) {
      addVelocityMovement();
      // TODO: maybe move below to the place where we retrieve velocity
      mVelocityTracker.computeCurrentVelocity(1000);
    }
  }

  public int getPointerId(int pointerIndex) {
    // TODO: this may result in pointer id returning values that are greater than getPointerCount
    // as we don't remap pointer ids. This is against the documentation and may result in some weird
    // effects. On the other hand remapping pointer IDs would require yet another array of pointers
    // to be allocated. As I believe in most of the cases code wouldn't rely on that assumption this
    // should be mostly ok.
    return mEvent.getPointerId(mPointerIndices[pointerIndex]);
  }

  public long getEventTime() {
    return mEvent.getEventTime();
  }

  public int findPointerIndex(int pointerId) {
    for (int i = 0; i < mPointersCount; i++) {
      if (mEvent.getPointerId(mPointerIndices[i]) == pointerId) {
        return i;
      }
    }
    return -1;
  }

  public void recycle() {
    mEvent.recycle();
  }

  public float getPressure(int pointerIndex) {
    return mEvent.getPressure(mPointerIndices[pointerIndex]);
  }

  public float getLastPointerX(boolean averageTouches) {
    int excludeIndex = getActionMasked() == ACTION_POINTER_UP ?
            getActionIndex() : -1;

    if (averageTouches) {
      float sum = 0f;
      int count = 0;
      for (int i = 0, size = getPointerCount(); i < size; i++) {
        if (i != excludeIndex) {
          sum += getRawX(i);
          count++;
        }
      }
      return sum / count;
    } else {
      int lastPointerIdx = getPointerCount() - 1;
      while (lastPointerIdx == excludeIndex) {
        lastPointerIdx--;
      }
      return getRawX(lastPointerIdx);
    }
  }

  public float getLastPointerY(boolean averageTouches) {
    int excludeIndex = getActionMasked() == ACTION_POINTER_UP ?
            getActionIndex() : -1;

    if (averageTouches) {
      float sum = 0f;
      int count = 0;
      for (int i = 0, size = getPointerCount(); i < size; i++) {
        if (i != excludeIndex) {
          sum += getRawY(i);
          count++;
        }
      }
      return sum / count;
    } else {
      int lastPointerIdx = getPointerCount() - 1;
      while (lastPointerIdx == excludeIndex) {
        lastPointerIdx--;
      }
      return getRawY(lastPointerIdx);
    }
  }

  static String actionToString(int action) {
    return android.view.MotionEvent.actionToString(action);
  }
}
