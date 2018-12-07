package com.swmansion.gesturehandler.react;

import android.support.v4.util.Pools;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.uimanager.events.Event;
import com.facebook.react.uimanager.events.RCTEventEmitter;
import com.swmansion.gesturehandler.GestureHandler;

public class RNGestureHandlerPassBoundsEvent extends Event<RNGestureHandlerPassBoundsEvent>{

  public static final String EVENT_NAME = "onGestureHandlerPassBounds";

  private static final int TOUCH_EVENTS_POOL_SIZE = 7; // magic

  private static final Pools.SynchronizedPool<RNGestureHandlerPassBoundsEvent> EVENTS_POOL =
          new Pools.SynchronizedPool<>(TOUCH_EVENTS_POOL_SIZE);

  public static RNGestureHandlerPassBoundsEvent obtain(
          GestureHandler handler,
          boolean isOutside) {
    RNGestureHandlerPassBoundsEvent event = EVENTS_POOL.acquire();
    if (event == null) {
      event = new RNGestureHandlerPassBoundsEvent();
    }
    event.init(handler, isOutside);
    return event;
  }

  private WritableMap mExtraData;

  private RNGestureHandlerPassBoundsEvent() {
  }

  private void init(
          GestureHandler handler,
          boolean isOutside) {
    super.init(handler.getView().getId());
    mExtraData = Arguments.createMap();

    mExtraData.putBoolean("isOutside", isOutside);
  }

  @Override
  public void onDispose() {
    mExtraData = null;
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
    rctEventEmitter.receiveEvent(getViewTag(), EVENT_NAME, mExtraData);
  }
}
