package com.swmansion.gesturehandler.react;

import android.support.v4.util.Pools;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.uimanager.PixelUtil;
import com.facebook.react.uimanager.events.Event;
import com.facebook.react.uimanager.events.RCTEventEmitter;

public class RNGestureHandlerEvent extends Event<RNGestureHandlerEvent> {

  public static final String EVENT_NAME = "onGestureHandlerEvent";

  private static final int TOUCH_EVENTS_POOL_SIZE = 7; // magic

  private static final Pools.SynchronizedPool<RNGestureHandlerEvent> EVENTS_POOL =
          new Pools.SynchronizedPool<>(TOUCH_EVENTS_POOL_SIZE);

  public static RNGestureHandlerEvent obtain(
          int viewTag,
          int handlerTag,
          int state,
          float viewX,
          float viewY,
          float translationX,
          float translationY) {
    RNGestureHandlerEvent event = EVENTS_POOL.acquire();
    if (event == null) {
      event = new RNGestureHandlerEvent();
    }
    event.init(viewTag, handlerTag, state, viewX, viewY, translationX, translationY);
    return event;
  }

  private int mState, mHandlerTag;
  private float mViewX, mViewY, mTranslationY, mTranslationX;

  private RNGestureHandlerEvent() {
  }

  private void init(
          int viewTag,
          int handlerTag,
          int state,
          float viewX,
          float viewY,
          float translationX,
          float translationY) {
    super.init(viewTag);
    mHandlerTag = handlerTag;
    mState = state;
    mViewX = viewX;
    mViewY = viewY;
    mTranslationX = translationX;
    mTranslationY = translationY;
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
    data.putDouble("x", PixelUtil.toDIPFromPixel(mViewX));
    data.putDouble("y", PixelUtil.toDIPFromPixel(mViewY));
    if (!Float.isNaN(mTranslationX)) {
      data.putDouble("translationX", PixelUtil.toDIPFromPixel(mTranslationX));
      data.putDouble("translationY", PixelUtil.toDIPFromPixel(mTranslationY));
    }
    rctEventEmitter.receiveEvent(getViewTag(), EVENT_NAME, data);
  }
}
