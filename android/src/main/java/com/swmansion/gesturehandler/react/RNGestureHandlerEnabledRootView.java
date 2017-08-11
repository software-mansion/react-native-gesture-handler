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

  private class RootViewGestureHandler extends GestureHandler {
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
  }

  private @Nullable RNGestureHandlerRegistry mRegistry;
  private @Nullable GestureHandlerOrchestrator mOrchestrator;

  private int mRootViewTag = -1;
  private @Nullable GestureHandler mJSGestureHandler;

  public RNGestureHandlerEnabledRootView(Context context) {
    super(context);
  }

  @Override
  public boolean onInterceptTouchEvent(MotionEvent ev) {
    if (mOrchestrator == null) {
      return super.onInterceptTouchEvent(ev);
    }
    return true;
  }

  @Override
  public boolean onTouchEvent(MotionEvent ev) {
    if (mOrchestrator == null) {
      return super.onTouchEvent(ev);
    }
    boolean result = mOrchestrator.onTouchEvent(ev);
    super.onTouchEvent(ev);
    return result;
  }

  /**
   * This method is used to lazily initialze gesture handler registry and orchestrator. Unless
   * {@code #getRegistry} is called neither of those would be initialized and the whole module will
   * be in a "disabled" state and all touch related events will fallback to default RN behaviour.
   */
  private void initialize() {
    mRegistry = new RNGestureHandlerRegistry();
    mOrchestrator = new GestureHandlerOrchestrator(this, mRegistry);
    mOrchestrator.setMinimumAlphaForTraversal(MIN_ALPHA_FOR_TOUCH);
    if (mRootViewTag >= 0) {
      updateRootViewTag(mRootViewTag);
    }
  }

  private void updateRootViewTag(int rootViewTag) {
    mRootViewTag = rootViewTag;
    if (mRegistry != null && mJSGestureHandler == null) {
      mJSGestureHandler = new RootViewGestureHandler();
      mJSGestureHandler.setTag(-mRootViewTag);
      mRegistry.registerHandlerForViewWithTag(rootViewTag, mJSGestureHandler);
    }
  }

  public RNGestureHandlerRegistry getRegistry() {
    if (mRegistry == null) {
      initialize();
    }
    return mRegistry;
  }

  @Override
  public void setRootViewTag(int rootViewTag) {
    updateRootViewTag(rootViewTag);
    super.setRootViewTag(rootViewTag);
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
