package com.swmansion.gesturehandler;

import android.view.MotionEvent;

public class TapGestureHandler extends GestureHandler<TapGestureHandler> {
  public TapGestureHandler() {
    setCanStartHandlingWithDownEventOnly(true);
    setShouldCancelWhenOutside(true);
  }

  @Override
  protected void onHandle(MotionEvent event) {
    if (getState() == STATE_UNDETERMINED) {
      moveToState(STATE_BEGAN);
    }
    if (getState() == STATE_BEGAN && event.getActionMasked() == MotionEvent.ACTION_UP) {
      moveToState(STATE_ACTIVE);
    }
  }
}
