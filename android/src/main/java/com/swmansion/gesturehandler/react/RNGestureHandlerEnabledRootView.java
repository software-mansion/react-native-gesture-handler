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

  private @Nullable RNGestureHandlerRegistry mRegistry;
  private @Nullable GestureHandlerOrchestrator mOrchestrator;

  private int mRootViewTag = -1;
  private @Nullable GestureHandler mJSGestureHandler;

  public RNGestureHandlerEnabledRootView(Context context) {
    super(context);
  }

  private boolean mShouldIntercept = false;
  private boolean mPassingTouch = false;

  private class RootViewGestureHandler extends GestureHandler {
    @Override
    protected void onHandle(MotionEvent event) {
      int currentState = getState();
      if (currentState == STATE_UNDETERMINED) {
        begin();
        mShouldIntercept = false;
      }
      if (event.getActionMasked() == MotionEvent.ACTION_UP) {
        end();
      }
    }

    @Override
    protected void onCancel() {
      mShouldIntercept = true;
      long time = SystemClock.uptimeMillis();
      MotionEvent event = MotionEvent.obtain(time, time, MotionEvent.ACTION_CANCEL, 0, 0, 0);
      event.setAction(MotionEvent.ACTION_CANCEL);
      onChildStartedNativeGesture(event);
    }
  }

  @Override
  public void requestDisallowInterceptTouchEvent(boolean disallowIntercept) {
    // If this method gets called it means that some native view is attempting to grab lock for
    // touch event delivery. In that case we cancel all gesture recognizers
    if (!mPassingTouch) {
      // if we are in the process of delivering touch events via GH orchestrator, we don't want to
      // treat it as a native gesture capturing the lock
      tryCancelAllHandlers();
    }
    super.requestDisallowInterceptTouchEvent(disallowIntercept);
  }

  @Override
  public boolean dispatchTouchEvent(MotionEvent ev) {
    if (mOrchestrator == null) {
      return super.dispatchTouchEvent(ev);
    }

    // We mark `mPassingTouch` before we get into `mOrchestrator.onTouchEvent` so that we can tell
    // if `requestDisallow` has been called as a result of a normal gesture handling process or
    // as a result of one of the gesture handlers activating
    mPassingTouch = true;
    mOrchestrator.onTouchEvent(ev);
    mPassingTouch = false;

    if (mShouldIntercept) {
      return true;
    } else {
      return super.dispatchTouchEvent(ev);
    }
  }

  private void tryCancelAllHandlers() {
    // In order to cancel handlers we activate handler that is hooked to the root view
    if (mJSGestureHandler != null && mJSGestureHandler.getState() == GestureHandler.STATE_BEGAN) {
      // Try activate main JS handler
      mJSGestureHandler.activate();
      mJSGestureHandler.end();
    }
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

  public void reset() {
    mRegistry = null;
    mOrchestrator = null;
    mJSGestureHandler = null;
    mRootViewTag = -1;
    mShouldIntercept = false;
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
          tryCancelAllHandlers();
        }
      });
    }
  }
}
