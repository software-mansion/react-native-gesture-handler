package com.swmansion.gesturehandler;

import android.view.MotionEvent;
import android.view.View;

public class GestureHandler<T extends GestureHandler> {

  public static final int STATE_UNDETERMINED = 0;
  public static final int STATE_FAILED = 2;
  public static final int STATE_BEGAN = 3;
  public static final int STATE_CANCELLED = 4;
  public static final int STATE_ACTIVE = 5;

  private int mTag;
  private View mView;
  private int mState = STATE_UNDETERMINED;
  private boolean mHasStarted = false;
  private float mX, mY;

  private boolean mShouldCancelWhenOutside;
  private boolean mShouldCancelOthersWhenActivated;
  private boolean mCanStartHandlingWithDownEventOnly;

  private GestureHandlerOrchestrator mOrchestrator;
  private OnTouchEventListener<T> mListener;

  public T setShouldCancelWhenOutside(boolean shouldCancelWhenOutside) {
    mShouldCancelWhenOutside = shouldCancelWhenOutside;
    return (T) this;
  }

  public T setShouldCancelOthersWhenActivated(boolean shouldCancelOthersWhenActivated) {
    mShouldCancelOthersWhenActivated = shouldCancelOthersWhenActivated;
    return (T) this;
  }

  public T setCanStartHandlingWithDownEventOnly(boolean canStartHandlingWithDownEventOnly) {
    mCanStartHandlingWithDownEventOnly = canStartHandlingWithDownEventOnly;
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
    mView = view;
    mOrchestrator = orchestrator;
  }

  public final void handle(MotionEvent event) {
    if (mState == STATE_CANCELLED || mState == STATE_FAILED) {
      return;
    }
    mX = event.getX();
    mY = event.getY();
    if (mCanStartHandlingWithDownEventOnly && !mHasStarted &&
            event.getActionMasked() != MotionEvent.ACTION_DOWN) {
      moveToState(STATE_FAILED);
    } else {
      mHasStarted = true;
      if (mState == STATE_ACTIVE) {
        if (mShouldCancelWhenOutside && !isWithinBounds(event)) {
          cancel();
        }
      }
      onHandle(event);
    }
    if (mListener != null) {
      mListener.onTouchEvent((T) this, event);
    }
  }

  public void moveToState(int newState) {
    if (mState == newState) {
      return;
    }
    int oldState = mState;
    mState = newState;
    if (newState == STATE_ACTIVE) {
      if (mShouldCancelOthersWhenActivated) {
        mOrchestrator.cancelOtherGestureHandlers(this);
      }
    }
    onStateChange(oldState, newState);
    if (mListener != null) {
      mListener.onStateChange((T) this, newState, oldState);
    }
  }

  public boolean wantEvents() {
    return mState != STATE_FAILED && mState != STATE_CANCELLED;
  }

  public int getState() {
    return mState;
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

  protected void onHandle(MotionEvent event) {
    moveToState(STATE_FAILED);
  }

  protected void onCancel() {
  }

  protected void onReset() {
  }

  protected void onStateChange(int previousState, int newState) {
  }

  public final void reset() {
    onReset();
    moveToState(STATE_UNDETERMINED);
    mView = null;
    mOrchestrator = null;
    mHasStarted = false;
  }

  protected static String stateToString(int state) {
    switch (state) {
      case STATE_UNDETERMINED: return "UNDETERMINED";
      case STATE_ACTIVE: return "ACTIVE";
      case STATE_FAILED: return "FAILED";
      case STATE_BEGAN: return "BEGIN";
      case STATE_CANCELLED: return "CANCELLED";
    }
    return null;
  }

  public GestureHandler setOnTouchEventListener(OnTouchEventListener<T> listener) {
    mListener = listener;
    return this;
  }
}
