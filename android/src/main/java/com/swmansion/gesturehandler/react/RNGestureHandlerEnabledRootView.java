package com.swmansion.gesturehandler.react;

import android.content.Context;
import android.os.Bundle;
import android.view.MotionEvent;

import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactRootView;
import com.facebook.react.bridge.ReactContext;

import javax.annotation.Nullable;

public class RNGestureHandlerEnabledRootView extends ReactRootView {

  private @Nullable ReactInstanceManager mReactInstanceManager;
  private @Nullable RNGestureHandlerRootHelper mGestureRootHelper;

  public RNGestureHandlerEnabledRootView(Context context) {
    super(context);
  }

  @Override
  public void requestDisallowInterceptTouchEvent(boolean disallowIntercept) {
    if (mGestureRootHelper != null) {
      mGestureRootHelper.requestDisallowInterceptTouchEvent(disallowIntercept);
    }
    super.requestDisallowInterceptTouchEvent(disallowIntercept);
  }

  @Override
  public boolean dispatchTouchEvent(MotionEvent ev) {
    if (mGestureRootHelper != null && mGestureRootHelper.dispatchTouchEvent(ev)) {
      return true;
    }
    return super.dispatchTouchEvent(ev);
  }

  public void initialize() {
    if (mGestureRootHelper != null) {
      throw new IllegalStateException("GestureHandler already initialized for root view " + this);
    }
    mGestureRootHelper = new RNGestureHandlerRootHelper(
            mReactInstanceManager.getCurrentReactContext(), this);
  }

  @Override
  public void startReactApplication(
          ReactInstanceManager reactInstanceManager,
          String moduleName,
          @Nullable Bundle initialProperties) {
    super.startReactApplication(reactInstanceManager, moduleName, initialProperties);
    mReactInstanceManager = reactInstanceManager;
  }

  @Override
  public void onAttachedToReactInstance() {
    super.onAttachedToReactInstance();
    RNGestureHandlerModule gestureHandlerModule = getGestureHandlerModule();
    if (gestureHandlerModule != null) {
      gestureHandlerModule.registerReactRootView(this);
    }
  }

  @Override
  public void unmountReactApplication() {
    if (mGestureRootHelper != null) {
      mGestureRootHelper.tearDown();
      mGestureRootHelper = null;
    }
    RNGestureHandlerModule gestureHandlerModule = getGestureHandlerModule();
    if (gestureHandlerModule != null) {
      gestureHandlerModule.unregisterReactRootView(this);
    }
    mReactInstanceManager = null;
    super.unmountReactApplication();
  }

  private @Nullable RNGestureHandlerModule getGestureHandlerModule() {
    if (mReactInstanceManager == null) {
      return null;
    }
    ReactContext reactContext = mReactInstanceManager.getCurrentReactContext();
    if (reactContext == null) {
      return null;
    }
    return reactContext.getNativeModule(RNGestureHandlerModule.class);
  }
}
