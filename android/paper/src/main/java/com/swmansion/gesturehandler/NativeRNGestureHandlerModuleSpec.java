package com.swmansion.gesturehandler;

import com.facebook.proguard.annotations.DoNotStrip;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.turbomodule.core.interfaces.TurboModule;
import javax.annotation.Nonnull;
import com.facebook.react.bridge.ReactMethod;

public abstract class NativeRNGestureHandlerModuleSpec extends ReactContextBaseJavaModule implements TurboModule {
  public static final String NAME = "RNGestureHandlerModule";

  public NativeRNGestureHandlerModuleSpec(ReactApplicationContext reactContext) {
    super(reactContext);
  }

  @Override
  public @Nonnull String getName() {
    return NAME;
  }

  @DoNotStrip
  @ReactMethod
  public abstract void handleSetJSResponder(double tag, boolean blockNativeResponder);

  @DoNotStrip
  @ReactMethod
  public abstract void handleClearJSResponder();

  @DoNotStrip
  @ReactMethod
  public abstract void createGestureHandler(String handlerName, double handlerTag, ReadableMap config);

  @DoNotStrip
  @ReactMethod
  public abstract void attachGestureHandler(double handlerTag, double newView, double actionType);

  @DoNotStrip
  @ReactMethod
  public abstract void updateGestureHandler(double handlerTag, ReadableMap newConfig);

  @DoNotStrip
  @ReactMethod
  public abstract void dropGestureHandler(double handlerTag);

  @DoNotStrip
  @ReactMethod
  public abstract boolean install();

  @DoNotStrip
  @ReactMethod
  public abstract void flushOperations();
}
