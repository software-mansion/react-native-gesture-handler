package com.swmansion.gesturehandler.react;

import android.content.Context;
import android.os.SystemClock;
import android.view.MotionEvent;

import com.facebook.react.ReactRootView;
import com.facebook.react.bridge.UiThreadUtil;
import com.swmansion.gesturehandler.GestureHandler;
import com.swmansion.gesturehandler.GestureHandlerOrchestrator;

import javax.annotation.Nullable;

public class RNGestureHandlerEnabledRootView extends ReactRootView {

  // Be default we require views to be at least 10% opaque in order to receive touch
  private static final float MIN_ALPHA_FOR_TOUCH = 0.1f;

  private final RNGestureHandlerRegistry mRegistry = new RNGestureHandlerRegistry();
  private final GestureHandlerOrchestrator mOrchestrator =
          new GestureHandlerOrchestrator(this, mRegistry);

  private @Nullable GestureHandler mJSGestureHandler;

  public RNGestureHandlerEnabledRootView(Context context) {
    super(context);
    mOrchestrator.setMinimumAlphaForTraversal(MIN_ALPHA_FOR_TOUCH);
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
          if (event.getActionMasked() == MotionEvent.ACTION_UP) {
            end();
          }
        }

        @Override
        protected void onCancel() {
          long time = SystemClock.uptimeMillis();
          MotionEvent event = MotionEvent.obtain(time, time, MotionEvent.ACTION_CANCEL, 0, 0, 0);
          event.setAction(MotionEvent.ACTION_CANCEL);
          onChildStartedNativeGesture(event);
        }
      };
      mJSGestureHandler.setTag(-getRootViewTag());
      getRegistry().registerHandlerForViewWithTag(rootViewTag, mJSGestureHandler);
      // TODO: figure out where to drop root view handlers
    }
  }

  /*package*/ void handleSetJSResponder(final int viewTag, final boolean blockNativeResponder) {
    if (blockNativeResponder) {
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
}
