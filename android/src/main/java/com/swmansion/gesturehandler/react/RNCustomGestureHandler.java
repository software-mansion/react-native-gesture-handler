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

import javax.annotation.Nullable;

public class RNCustomGestureHandler extends GestureHandler<RNCustomGestureHandler> {
  private static class RNGestureHandlerCustomHandlerEvent extends Event<RNGestureHandlerCustomHandlerEvent> {
    private WritableMap mExtraData;
    public static final String EVENT_NAME = "onGestureHandlerCustomEvent";
    private static final int TOUCH_EVENTS_POOL_SIZE = 12; // magic

    private static final Pools.SynchronizedPool<RNGestureHandlerCustomHandlerEvent> EVENTS_POOL =
            new Pools.SynchronizedPool<>(TOUCH_EVENTS_POOL_SIZE);

    private static RNGestureHandlerCustomHandlerEvent obtain(GestureHandler handler) {
      RNGestureHandlerCustomHandlerEvent event = EVENTS_POOL.acquire();
      if (event == null) {
        event = new RNGestureHandlerCustomHandlerEvent();
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
    sendEventToJS();
  }

  private void sendEventToJS() {
    EventDispatcher eventDispatcher = mContext
            .getNativeModule(UIManagerModule.class)
            .getEventDispatcher();
    RNGestureHandlerCustomHandlerEvent event = RNGestureHandlerCustomHandlerEvent.obtain(this);
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
        begin();
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