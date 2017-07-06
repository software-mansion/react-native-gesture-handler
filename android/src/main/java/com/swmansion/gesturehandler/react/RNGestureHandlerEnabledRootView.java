package com.swmansion.gesturehandler.react;

import android.content.Context;
import android.os.Bundle;
import android.os.SystemClock;
import android.util.AttributeSet;
import android.view.MotionEvent;

import com.facebook.common.logging.FLog;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactRootView;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.UiThreadUtil;
import com.facebook.react.common.ReactConstants;
import com.facebook.react.uimanager.JSTouchDispatcher;
import com.facebook.react.uimanager.UIManagerModule;
import com.facebook.react.uimanager.events.EventDispatcher;
import com.swmansion.gesturehandler.BaseGestureHandlerInteractionController;
import com.swmansion.gesturehandler.GestureHandler;
import com.swmansion.gesturehandler.GestureHandlerInteractionController;
import com.swmansion.gesturehandler.GestureHandlerOrchestrator;

import javax.annotation.Nullable;

public class RNGestureHandlerEnabledRootView extends ReactRootView {

  private final RNGestureHandlerRegistry mRegistry = new RNGestureHandlerRegistry();
  private final GestureHandlerOrchestrator mOrchestrator =
          new GestureHandlerOrchestrator(this, mRegistry);

  private @Nullable GestureHandler mJSGestureHandler;
  private GestureHandlerInteractionController mRootInteractionController =
          new BaseGestureHandlerInteractionController() {
    @Override
    public boolean shouldRequireHandlerToWaitForFailure(
            GestureHandler handler,
            GestureHandler otherHandler) {
      return handler.getState() == GestureHandler.STATE_ACTIVE;
    }
  };

  public RNGestureHandlerEnabledRootView(Context context) {
    super(context);
  }

  @Override
  public boolean onInterceptTouchEvent(MotionEvent ev) {
    return true;
  }

  @Override
  public boolean onTouchEvent(MotionEvent ev) {
    boolean result = mOrchestrator.onTouchEvent(ev);
    super.onTouchEvent(ev);
    return result;
  }

  public RNGestureHandlerRegistry getRegistry() {
    return mRegistry;
  }

  @Override
  public void setRootViewTag(int rootViewTag) {
    super.setRootViewTag(rootViewTag);
    if (mJSGestureHandler == null) {
      mJSGestureHandler = new GestureHandler() {
        @Override
        protected void onHandle(MotionEvent event) {
          int currentState = getState();
          if (currentState == STATE_UNDETERMINED) {
            begin();
          }
        }

        @Override
        protected void onCancel() {
          long time = SystemClock.uptimeMillis();
          MotionEvent event = MotionEvent.obtain(time, time, MotionEvent.ACTION_CANCEL, 0, 0, 0);
          event.setAction(MotionEvent.ACTION_CANCEL);
          onChildStartedNativeGesture(event);
        }

        @Override
        protected void onReset() {
          super.onReset();
        }
      };
      mJSGestureHandler.setTag(rootViewTag);
      getRegistry().registerHandlerForViewWithTag(rootViewTag, mJSGestureHandler);
      // TODO: figure out where to drop root view handlers
    }
  }

  /*package*/ void handleSetJSResponder(int viewTag, boolean blockNativeResponder) {
    UiThreadUtil.runOnUiThread(new Runnable() {
      @Override
      public void run() {
        if (mJSGestureHandler != null
                && mJSGestureHandler.getState() == GestureHandler.STATE_BEGAN) {
          // Try activate main JS handler
          mJSGestureHandler.activate();
          mJSGestureHandler.end();
        }
      }
    });
  }
}
