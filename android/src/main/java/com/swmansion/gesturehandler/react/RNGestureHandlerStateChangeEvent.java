package com.swmansion.gesturehandler.react;

import android.support.v4.util.Pools;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.uimanager.PixelUtil;
import com.facebook.react.uimanager.events.Event;
import com.facebook.react.uimanager.events.RCTEventEmitter;

public class RNGestureHandlerStateChangeEvent extends Event<RNGestureHandlerStateChangeEvent>{

  public static final String EVENT_NAME = "onGestureHandlerStateChange";

  private static final int TOUCH_EVENTS_POOL_SIZE = 7; // magic

  private static final Pools.SynchronizedPool<RNGestureHandlerStateChangeEvent> EVENTS_POOL =
          new Pools.SynchronizedPool<>(TOUCH_EVENTS_POOL_SIZE);

  public static RNGestureHandlerStateChangeEvent obtain(
          int viewTag,
          int handlerTag,
          int newState,
          int oldState,
          float lastX,
          float lastY,
          float lastTranslationX,
          float lastTranslationY) {
    RNGestureHandlerStateChangeEvent event = EVENTS_POOL.acquire();
    if (event == null) {
      event = new RNGestureHandlerStateChangeEvent();
    }
    event.init(
            viewTag,
            handlerTag,
            newState,
            oldState,
            lastX,
            lastY,
            lastTranslationX,
            lastTranslationY);
    return event;
  }

  private int mState, mOldState, mHandlerTag;
  private float mLastX, mLastY, mLastTranslationX, mLastTranslationY;

  private RNGestureHandlerStateChangeEvent() {
  }

  private void init(
          int viewTag,
          int handlerTag,
          int newState,
          int oldState,
          float lastX,
          float lastY,
          float lastTranslationX,
          float lastTranslationY) {
    super.init(viewTag);
    mHandlerTag = handlerTag;
    mState = newState;
    mOldState = oldState;
    mLastX = lastX;
    mLastY = lastY;
    mLastTranslationX = lastTranslationX;
    mLastTranslationY = lastTranslationY;
  }

  @Override
  public void onDispose() {
    EVENTS_POOL.release(this);
  }

  @Override
  public String getEventName() {
    return EVENT_NAME;
  }

  @Override
  public boolean canCoalesce() {
    // TODO: coalescing
    return false;
  }

  @Override
  public short getCoalescingKey() {
    // TODO: coalescing
    return 0;
  }

  @Override
  public void dispatch(RCTEventEmitter rctEventEmitter) {
    WritableMap data = Arguments.createMap();
    data.putInt("handlerTag", mHandlerTag);
    data.putInt("state", mState);
    data.putInt("oldState", mOldState);
    data.putDouble("lastX", PixelUtil.toDIPFromPixel(mLastX));
    data.putDouble("lastY", PixelUtil.toDIPFromPixel(mLastY));
    if (!Float.isNaN(mLastTranslationX)) {
      data.putDouble("lastTranslationX", PixelUtil.toDIPFromPixel(mLastTranslationX));
      data.putDouble("lastTranslationY", PixelUtil.toDIPFromPixel(mLastTranslationY));
    }
    rctEventEmitter.receiveEvent(getViewTag(), EVENT_NAME, data);
  }
}
