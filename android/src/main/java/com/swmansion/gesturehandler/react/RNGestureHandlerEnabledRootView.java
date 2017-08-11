package com.swmansion.gesturehandler.react;

import android.content.Context;
import android.os.SystemClock;
import android.view.MotionEvent;

import com.facebook.react.ReactRootView;
import com.facebook.react.bridge.UiThreadUtil;
import com.swmansion.gesturehandler.GestureHandler;
import com.swmansion.gesturehandler.GestureHandlerOrchestrator;
import com.swmansion.gesturehandler.NativeViewGestureHandler;

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

  private long mLastProcessedEventTime = -1;
  private int mLastProcessedEventAction = 0;
  private boolean mShouldIntercept = false;
  private boolean mPassingTouch = false;
  private boolean mPreventingCancel = false;
  private boolean mShouldPreventCancel = false;

  private class RootViewGestureHandler extends GestureHandler {
    @Override
    protected void onHandle(MotionEvent event) {
      int currentState = getState();
      if (currentState == STATE_UNDETERMINED) {
        begin();
        mShouldIntercept = false;
        mShouldPreventCancel = false;
      }
      if (event.getActionMasked() == MotionEvent.ACTION_UP) {
        end();
      }
    }

    @Override
    protected void onCancel() {
      mShouldIntercept = true;
      // if the last activated handler was a native wrapper, it means that it is also getting events
      // via a regular android touch event stream. In that case we want to avoid android native
      // logic from dispatching CANCEL to that view, as it may not handle that correctly
      mShouldPreventCancel = (mOrchestrator.getLastActivatedHandler() instanceof NativeViewGestureHandler);
      long time = SystemClock.uptimeMillis();
      MotionEvent event = MotionEvent.obtain(time, time, MotionEvent.ACTION_CANCEL, 0, 0, 0);
      event.setAction(MotionEvent.ACTION_CANCEL);
      onChildStartedNativeGesture(event);
    }
  }

  @Override
  public boolean onInterceptTouchEvent(MotionEvent ev) {
    if (mOrchestrator == null) {
      return super.onInterceptTouchEvent(ev);
    }
    if (mPreventingCancel) {
      // if this flag is set it means that we deliver a fake "ACTION_DOWN" event to make rootview
      // clear first touch target so that the cancel event from the actual `onInterceptTouchEvent`
      // call won't be called
      return true;
    }
    passTouchEventOnce(ev);
    if (super.onInterceptTouchEvent(ev)) {
      return true;
    }
    if (mShouldIntercept && mShouldPreventCancel) {
      // In order to prevent CANCEL from being dispatched by android we simulate a fake "ACTION_DOWN"
      // that will reset root view's state. Then this action will immediately get intercepted (thanks
      // to mPreventingCancel flag) and because of that CANCEL event won't propagate down the view
      // hierarchy.
      // This will be used only in the case when native view has
      mPreventingCancel = true;
      final long now = SystemClock.uptimeMillis();
      MotionEvent event = MotionEvent.obtain(now, now,
              MotionEvent.ACTION_DOWN, 0.0f, 0.0f, 0);
      dispatchTouchEvent(event);
      mPreventingCancel = false;
    }
    return mShouldIntercept;
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
  public boolean onTouchEvent(MotionEvent ev) {
    if (mOrchestrator == null) {
      return super.onTouchEvent(ev);
    }
    if (mPreventingCancel) {
      return true;
    }
    passTouchEventOnce(ev);
    super.onTouchEvent(ev);
    return true;
  }

  private void passTouchEventOnce(MotionEvent ev) {
    // Since we get events in `onInterceptTouch` and in `onTouch` handlers we want to avoid passing
    // same event twice to the GH orchestrator. We use action and eventTime attributes of an event
    // object to tell if have already processed the given event
    long eventTime = ev.getEventTime();
    int action = ev.getAction();
    if (mLastProcessedEventAction != action || eventTime > mLastProcessedEventTime) {
      mLastProcessedEventTime = eventTime;
      // We mark `mPassingTouch` before we get into `mOrchestrator.onTouchEvent` so that we can tell
      // if `requestDisallow` has been called as a result of a normal gesture handling process or
      // as a result of one of the gesture handlers activating
      mPassingTouch = true;
      mOrchestrator.onTouchEvent(ev);
      mPassingTouch = false;
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
    mLastProcessedEventTime = -1;
    mShouldIntercept = false;
    mShouldPreventCancel = false;
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
