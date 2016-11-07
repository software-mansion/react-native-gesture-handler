package com.swmansion.gesturehandler;

import android.view.MotionEvent;
import android.view.View;

public class GestureHandler<T extends GestureHandler> {

  public static final int STATE_UNDETERMINED = 0;
  public static final int STATE_FAILED = 2;
  public static final int STATE_BEGAN = 3;
  public static final int STATE_CANCELLED = 4;
  public static final int STATE_ACTIVE = 5;
  public static final int STATE_END = 6;

  private int mTag;
  private View mView;
  private int mState = STATE_UNDETERMINED;
  private float mX, mY;

  private boolean mShouldCancelWhenOutside;
  private boolean mShouldCancelOthersWhenActivated;
  private boolean mShouldBeRequiredByOthersToFail;

  private GestureHandlerOrchestrator mOrchestrator;
  private OnTouchEventListener<T> mListener;
  /*package*/ boolean mIsActive; // set and accessed only by the orchestrator

  /*package*/ void dispatchStateChange(int newState, int prevState) {
    if (mListener != null) {
      mListener.onStateChange((T) this, newState, prevState);
    }
  }

  /*package*/ void dispatchTouchEvent(MotionEvent event) {
    if (mListener != null) {
      mListener.onTouchEvent((T) this, event);
    }
  }

  public T setShouldCancelWhenOutside(boolean shouldCancelWhenOutside) {
    mShouldCancelWhenOutside = shouldCancelWhenOutside;
    return (T) this;
  }

  public T setShouldCancelOthersWhenActivated(boolean shouldCancelOthersWhenActivated) {
    mShouldCancelOthersWhenActivated = shouldCancelOthersWhenActivated;
    return (T) this;
  }

  public T setShouldBeRequiredByOthersToFail(boolean shouldBeRequiredByOthersToFail) {
    mShouldBeRequiredByOthersToFail = shouldBeRequiredByOthersToFail;
    return (T) this;
  }

  public void setTag(int tag) {
    mTag = tag;
  }

  public int getTag() {
    return mTag;
  }

  public View getView() {
    return mView;
  }

  public float getX() {
    return mX;
  }

  public float getY() {
    return mY;
  }

  public final void prepare(View view, GestureHandlerOrchestrator orchestrator) {
    if (mView != null || mOrchestrator != null) {
      throw new IllegalStateException("Already prepared or hasn't been reset");
    }
    mState = STATE_UNDETERMINED;

    mView = view;
    mOrchestrator = orchestrator;
  }

  public final void handle(MotionEvent event) {
    if (mState == STATE_CANCELLED || mState == STATE_FAILED || mState == STATE_END) {
      return;
    }
    mX = event.getX();
    mY = event.getY();
    if (mState == STATE_ACTIVE) {
      if (mShouldCancelWhenOutside && !isWithinBounds(event)) {
        cancel();
        return;
      }
    }
    onHandle(event);
  }

  private void moveToState(int newState) {
    if (mState == newState) {
      return;
    }
    int oldState = mState;
    mState = newState;

    mOrchestrator.onHandlerStateChange(this, newState, oldState);

    onStateChange(newState, oldState);
  }

  public boolean wantEvents() {
    return mState != STATE_FAILED && mState != STATE_CANCELLED && mState != STATE_END;
  }

  public int getState() {
    return mState;
  }

  public boolean isRequiredByHandlerToFail(GestureHandler handler) {
    return handler != this && mShouldBeRequiredByOthersToFail;
  }

  public boolean isRequiredToCancelUponHandlerActivation(GestureHandler handler) {
    return handler != this && handler.mShouldCancelOthersWhenActivated;
  }

  protected boolean isWithinBounds(MotionEvent event) {
    float posX = event.getX();
    float posY = event.getY();
    return posX >= 0 && posX < mView.getWidth() && posY >= 0 && posY < mView.getHeight();
  }

  public final void cancel() {
    if (mState == STATE_ACTIVE || mState == STATE_UNDETERMINED || mState == STATE_BEGAN) {
      onCancel();
      moveToState(STATE_CANCELLED);
    }
  }

  public final void fail() {
    if (mState == STATE_ACTIVE || mState == STATE_UNDETERMINED || mState == STATE_BEGAN) {
      moveToState(STATE_FAILED);
    }
  }

  public final void activate() {
    if (mState == STATE_UNDETERMINED || mState == STATE_BEGAN) {
      moveToState(STATE_ACTIVE);
    }
  }

  public final void begin() {
    if (mState == STATE_UNDETERMINED) {
      moveToState(STATE_BEGAN);
    }
  }

  public final void end() {
    if (mState == STATE_BEGAN || mState == STATE_ACTIVE) {
      moveToState(STATE_END);
    }
  }

  protected void onHandle(MotionEvent event) {
    moveToState(STATE_FAILED);
  }

  protected void onStateChange(int newState, int previousState) {
  }

  protected void onReset() {
  }

  protected void onCancel() {
  }

  public final void reset() {
    mView = null;
    mOrchestrator = null;
    onReset();
  }

  public static String stateToString(int state) {
    switch (state) {
      case STATE_UNDETERMINED: return "UNDETERMINED";
      case STATE_ACTIVE: return "ACTIVE";
      case STATE_FAILED: return "FAILED";
      case STATE_BEGAN: return "BEGIN";
      case STATE_CANCELLED: return "CANCELLED";
      case STATE_END: return "END";
    }
    return null;
  }

  public GestureHandler setOnTouchEventListener(OnTouchEventListener<T> listener) {
    mListener = listener;
    return this;
  }

  @Override
  public String toString() {
    return this.getClass().getSimpleName() + "@" + mView;
  }
}
