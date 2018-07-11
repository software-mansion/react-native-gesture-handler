package com.swmansion.gesturehandler.react;

import android.content.Context;
import android.support.v4.util.Pools;
import android.view.MotionEvent;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.ReactContext;

import com.facebook.react.bridge.WritableMap;
import com.facebook.react.uimanager.PixelUtil;
import com.facebook.react.uimanager.UIManagerModule;
import com.facebook.react.uimanager.events.Event;
import com.facebook.react.uimanager.events.EventDispatcher;
import com.facebook.react.uimanager.events.RCTEventEmitter;
import com.swmansion.gesturehandler.GestureHandler;

public class RNCustomGestureHandler extends GestureHandler<RNCustomGestureHandler> {
  private static class RNGestureHandlerCustomEvent extends Event<RNGestureHandlerCustomEvent> {
    private WritableMap mExtraData;
    public static final String EVENT_NAME = "onGestureHandlerCustomEvent";
    private static final int CUSTOM_TOUCH_EVENTS_POOL_SIZE = 12; // magic

    private static final Pools.SynchronizedPool<RNGestureHandlerCustomEvent> EVENTS_POOL =
            new Pools.SynchronizedPool<>(CUSTOM_TOUCH_EVENTS_POOL_SIZE);

    private static RNGestureHandlerCustomEvent obtain(GestureHandler handler) {
      RNGestureHandlerCustomEvent event = EVENTS_POOL.acquire();
      if (event == null) {
        event = new RNGestureHandlerCustomEvent();
      }
      event.init(handler);
      return event;
    }

    @Override
    public String getEventName() {
      return EVENT_NAME;
    }

    @Override
    public void dispatch(RCTEventEmitter rctEventEmitter) {
      rctEventEmitter.receiveEvent(getViewTag(), EVENT_NAME, mExtraData);
    }

    private void init(GestureHandler handler) {
      super.init(handler.getView().getId());
      mExtraData = Arguments.createMap();
      mExtraData.putInt("numberOfPointers", handler.getNumberOfPointers());
      mExtraData.putInt("handlerTag", handler.getTag());
      mExtraData.putInt("state", handler.getState());
      mExtraData.putDouble("x", PixelUtil.toDIPFromPixel(handler.getX()));
      mExtraData.putDouble("y", PixelUtil.toDIPFromPixel(handler.getY()));
    }
  }
  private ReactContext mContext;

  public RNCustomGestureHandler(Context context) {
    mContext = (ReactContext) context;
  }

  @Override
  protected void onHandle(MotionEvent event) {
    int action = event.getActionMasked();
    int state = getState();
    if (state == STATE_UNDETERMINED) {
      begin();
    }
    if (action == MotionEvent.ACTION_UP) {
      if (state == STATE_ACTIVE || state == STATE_BEGAN) {
        fail();
      }
    }
    sendEventToJS();
  }

  private void sendEventToJS() {
    EventDispatcher eventDispatcher = mContext
            .getNativeModule(UIManagerModule.class)
            .getEventDispatcher();
    RNGestureHandlerCustomEvent event = RNGestureHandlerCustomEvent.obtain(this);
    eventDispatcher.dispatchEvent(event);
  }

  public void setState(int state) {
    switch (state) {
      // TODO not to allow every scenario
      case STATE_UNDETERMINED:
        // no-op
        break;
      case STATE_FAILED:
        fail();
        break;
      case STATE_BEGAN:
        // no-op
        break;
      case STATE_CANCELLED:
        cancel();
        break;
      case STATE_ACTIVE:
        activate();
        break;
      case STATE_END:
        end();
    }
  }
}