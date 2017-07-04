package com.swmansion.gesturehandler.react;

import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;

import com.facebook.react.bridge.JSApplicationIllegalArgumentException;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableType;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.uimanager.PixelUtil;
import com.facebook.react.uimanager.UIManagerModule;
import com.facebook.react.uimanager.events.EventDispatcher;
import com.swmansion.gesturehandler.GestureHandler;
import com.swmansion.gesturehandler.LongPressGestureHandler;
import com.swmansion.gesturehandler.NativeViewGestureHandler;
import com.swmansion.gesturehandler.OnTouchEventListener;
import com.swmansion.gesturehandler.PanGestureHandler;
import com.swmansion.gesturehandler.PinchGestureHandler;
import com.swmansion.gesturehandler.RotationGestureHandler;
import com.swmansion.gesturehandler.TapGestureHandler;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.logging.Handler;

import javax.annotation.Nullable;

public class RNGestureHandlerModule extends ReactContextBaseJavaModule {

  public static final String MODULE_NAME = "RNGestureHandlerModule";

  private static final String KEY_SHOULD_CANCEL_WHEN_OUTSIDE = "shouldCancelWhenOutside";
  private static final String KEY_SHOULD_CANCEL_OTHERS_WHEN_ACTIVATED =
          "shouldCancelOthersWhenActivated";
  private static final String KEY_SHOULD_BE_REQUIRED_BY_OTHERS_TO_FAIL =
          "shouldBeRequiredByOthersToFail";
  private static final String KEY_HIT_SLOP = "hitSlop";
  private static final String KEY_HIT_SLOP_LEFT = "left";
  private static final String KEY_HIT_SLOP_TOP = "left";
  private static final String KEY_HIT_SLOP_RIGHT = "right";
  private static final String KEY_HIT_SLOP_BOTTOM = "bottom";
  private static final String KEY_HIT_SLOP_VERTICAL = "vertical";
  private static final String KEY_HIT_SLOP_HORIZONTAL = "horizontal";
  private static final String KEY_NATIVE_VIEW_SHOULD_ACTIVATE_ON_START = "shouldActivateOnStart";
  private static final String KEY_TAP_NUMBER_OF_TAPS = "numberOfTaps";
  private static final String KEY_TAP_MAX_DURATION_MS = "maxDurationMs";
  private static final String KEY_TAP_MAX_DELAY_MS = "maxDelayMs";
  private static final String KEY_LONG_PRESS_MIN_DURATION_MS = "minDurationMs";
  private static final String KEY_PAN_MIN_DELTA_X = "minDeltaX";
  private static final String KEY_PAN_MIN_DELTA_Y = "minDeltaY";
  private static final String KEY_PAN_MIN_DIST = "minDist";
  private static final String KEY_PAN_MAX_VELOCITY = "maxVelocity";

  private abstract static class HandlerFactory<T extends GestureHandler>
          implements RNGestureHandlerEventDataExtractor<T> {

    public abstract Class<T> getType();

    public abstract String getName();

    public abstract T create();

    public void configure(T handler, ReadableMap config) {
      if (config.hasKey(KEY_SHOULD_CANCEL_WHEN_OUTSIDE)) {
        handler.setShouldCancelWhenOutside(config.getBoolean(KEY_SHOULD_CANCEL_WHEN_OUTSIDE));
      }
      if (config.hasKey(KEY_SHOULD_CANCEL_OTHERS_WHEN_ACTIVATED)) {
        handler.setShouldCancelOthersWhenActivated(
                config.getBoolean(KEY_SHOULD_CANCEL_OTHERS_WHEN_ACTIVATED));
      }
      if (config.hasKey(KEY_SHOULD_BE_REQUIRED_BY_OTHERS_TO_FAIL)) {
        handler.setShouldBeRequiredByOthersToFail(
                config.getBoolean(KEY_SHOULD_BE_REQUIRED_BY_OTHERS_TO_FAIL));
      }
      if (config.hasKey(KEY_HIT_SLOP)) {
        handleHitSlopProperty(handler, config);
      }
    }

    @Override
    public void extractEventData(T handler, WritableMap eventData) {
      // empty default impl
    }
  }

  private static class NativeViewGestureHandlerFactory extends
          HandlerFactory<NativeViewGestureHandler> {
    @Override
    public Class<NativeViewGestureHandler> getType() {
      return NativeViewGestureHandler.class;
    }

    @Override
    public String getName() {
      return "NativeViewGestureHandler";
    }

    @Override
    public NativeViewGestureHandler create() {
      return new NativeViewGestureHandler();
    }

    @Override
    public void configure(NativeViewGestureHandler handler, ReadableMap config) {
      super.configure(handler, config);
      if (config.hasKey(KEY_NATIVE_VIEW_SHOULD_ACTIVATE_ON_START)) {
        handler.setShouldActivateOnStart(
                config.getBoolean(KEY_NATIVE_VIEW_SHOULD_ACTIVATE_ON_START));
      }
    }
  }

  private static class TapGestureHandlerFactory extends HandlerFactory<TapGestureHandler> {
    @Override
    public Class<TapGestureHandler> getType() {
      return TapGestureHandler.class;
    }

    @Override
    public String getName() {
      return "TapGestureHandler";
    }

    @Override
    public TapGestureHandler create() {
      return new TapGestureHandler();
    }

    @Override
    public void configure(TapGestureHandler handler, ReadableMap config) {
      super.configure(handler, config);
      if (config.hasKey(KEY_TAP_NUMBER_OF_TAPS)) {
        handler.setNumberOfTaps(config.getInt(KEY_TAP_NUMBER_OF_TAPS));
      }
      if (config.hasKey(KEY_TAP_MAX_DURATION_MS)) {
        handler.setMaxDurationMs(config.getInt(KEY_TAP_MAX_DURATION_MS));
      }
      if (config.hasKey(KEY_TAP_MAX_DELAY_MS)) {
        handler.setMaxDelayMs(config.getInt(KEY_TAP_MAX_DELAY_MS));
      }
    }
  }

  private static class LongPressGestureHandlerFactory extends
          HandlerFactory<LongPressGestureHandler> {
    @Override
    public Class<LongPressGestureHandler> getType() {
      return LongPressGestureHandler.class;
    }

    @Override
    public String getName() {
      return "LongPressGestureHandler";
    }

    @Override
    public LongPressGestureHandler create() {
      return new LongPressGestureHandler();
    }

    @Override
    public void configure(LongPressGestureHandler handler, ReadableMap config) {
      super.configure(handler, config);
      if (config.hasKey(KEY_LONG_PRESS_MIN_DURATION_MS)) {
        handler.setMinDurationMs(config.getInt(KEY_LONG_PRESS_MIN_DURATION_MS));
      }
    }
  }

  private static class PanGestureHandlerFactory extends HandlerFactory<PanGestureHandler> {
    @Override
    public Class<PanGestureHandler> getType() {
      return PanGestureHandler.class;
    }

    @Override
    public String getName() {
      return "PanGestureHandler";
    }

    @Override
    public PanGestureHandler create() {
      return new PanGestureHandler();
    }

    @Override
    public void configure(PanGestureHandler handler, ReadableMap config) {
      super.configure(handler, config);
      if (config.hasKey(KEY_PAN_MIN_DELTA_X)) {
        handler.setMinDx(PixelUtil.toPixelFromDIP(config.getDouble(KEY_PAN_MIN_DELTA_X)));
      }
      if (config.hasKey(KEY_PAN_MIN_DELTA_Y)) {
        handler.setMinDy(PixelUtil.toPixelFromDIP(config.getDouble(KEY_PAN_MIN_DELTA_Y)));
      }
      if (config.hasKey(KEY_PAN_MIN_DIST)) {
        handler.setMinDist(PixelUtil.toPixelFromDIP(config.getDouble(KEY_PAN_MIN_DIST)));
      }
      if (config.hasKey(KEY_PAN_MAX_VELOCITY)) {
        // This value is actually in DPs/ms, but we can use the same function as for converting
        // just from DPs to pixels as the unit we're converting is in the numerator
        handler.setMaxVelocity(PixelUtil.toPixelFromDIP(config.getDouble(KEY_PAN_MAX_VELOCITY)));
      }
    }

    @Override
    public void extractEventData(PanGestureHandler handler, WritableMap eventData) {
      eventData.putDouble("translationX", PixelUtil.toDIPFromPixel(handler.getTranslationX()));
      eventData.putDouble("translationY", PixelUtil.toDIPFromPixel(handler.getTranslationY()));
    }
  }

  private static class PinchGestureHandlerFactory extends HandlerFactory<PinchGestureHandler> {
    @Override
    public Class<PinchGestureHandler> getType() {
      return PinchGestureHandler.class;
    }

    @Override
    public String getName() {
      return "PinchGestureHandler";
    }

    @Override
    public PinchGestureHandler create() {
      return new PinchGestureHandler();
    }

    @Override
    public void extractEventData(PinchGestureHandler handler, WritableMap eventData) {
      eventData.putDouble("scale", handler.getScale());
      eventData.putDouble("velocity", handler.getVelocity());
    }
  }

  private static class RotationGestureHandlerFactory extends HandlerFactory<RotationGestureHandler> {
    @Override
    public Class<RotationGestureHandler> getType() {
      return RotationGestureHandler.class;
    }

    @Override
    public String getName() {
      return "RotationGestureHandler";
    }

    @Override
    public RotationGestureHandler create() {
      return new RotationGestureHandler();
    }

    @Override
    public void extractEventData(RotationGestureHandler handler, WritableMap eventData) {
      eventData.putDouble("rotation", handler.getRotation());
      eventData.putDouble("velocity", handler.getVelocity());
    }
  }

  private OnTouchEventListener mEventListener = new OnTouchEventListener() {
    @Override
    public void onTouchEvent(GestureHandler handler, MotionEvent event) {
      RNGestureHandlerModule.this.onTouchEvent(handler, event);
    }

    @Override
    public void onStateChange(GestureHandler handler, int newState, int oldState) {
      RNGestureHandlerModule.this.onStateChange(handler, newState, oldState);
    }
  };

  private HandlerFactory[] mHandlerFactories = new HandlerFactory[] {
          new NativeViewGestureHandlerFactory(),
          new TapGestureHandlerFactory(),
          new LongPressGestureHandlerFactory(),
          new PanGestureHandlerFactory(),
          new PinchGestureHandlerFactory(),
          new RotationGestureHandlerFactory()
  };
  private RNGestureHandlerRegistry mRegistry;

  public RNGestureHandlerModule(ReactApplicationContext reactContext) {
    super(reactContext);
  }

  @Override
  public String getName() {
    return MODULE_NAME;
  }

  @ReactMethod
  public void createGestureHandler(
          int viewTag,
          String handlerName,
          int handlerTag,
          ReadableMap config) {
    for (int i = 0; i < mHandlerFactories.length; i++) {
      HandlerFactory handlerFactory = mHandlerFactories[i];
      if (handlerFactory.getName().equals(handlerName)) {
        GestureHandler handler = handlerFactory.create();
        handler.setTag(handlerTag);
        handlerFactory.configure(handler, config);
        getRegistry().registerHandlerForViewWithTag(viewTag, handler);
        handler.setOnTouchEventListener(mEventListener);
        return;
      }
    }
    throw new JSApplicationIllegalArgumentException("Invalid handler name " + handlerName);
  }

  @ReactMethod
  public void dropGestureHandlersForView(int viewTag) {
    getRegistry().dropHandlersForViewWithTag(viewTag);
  }

  @ReactMethod
  public void handleSetJSResponder(int viewTag, boolean blockNativeResponder) {
    getRootView().handleSetJSResponder(viewTag, blockNativeResponder);
  }

  @ReactMethod
  public void handleClearJSResponder() {
  }

  @Override
  public @Nullable Map getConstants() {
    return MapBuilder.of("State", MapBuilder.of(
            "UNDETERMINED", GestureHandler.STATE_UNDETERMINED,
            "BEGAN", GestureHandler.STATE_BEGAN,
            "ACTIVE", GestureHandler.STATE_ACTIVE,
            "CANCELLED", GestureHandler.STATE_CANCELLED,
            "FAILED", GestureHandler.STATE_FAILED,
            "END", GestureHandler.STATE_END
    ));
  }

  private RNGestureHandlerRegistry getRegistry() {
    if (mRegistry != null) {
      return mRegistry;
    }
    mRegistry = getRootView().getRegistry();
    return mRegistry;
  }

  private RNGestureHandlerEnabledRootView getRootView() {
    View contentView = getCurrentActivity().findViewById(android.R.id.content);
    View rootView = ((ViewGroup) contentView).getChildAt(0);
    if (!(rootView instanceof RNGestureHandlerEnabledRootView)) {
      throw new IllegalStateException("Root view seems not to be setup properly " + rootView);
    }
    return (RNGestureHandlerEnabledRootView) rootView;
  }

  @Override
  public void onCatalystInstanceDestroy() {
    if (mRegistry != null) {
      mRegistry.dropAllHandlers();
      mRegistry = null;
    }
    super.onCatalystInstanceDestroy();
  }

  private @Nullable HandlerFactory findFactoryForHandler(GestureHandler handler) {
    for (int i = 0; i < mHandlerFactories.length; i++) {
      HandlerFactory factory = mHandlerFactories[i];
      if (factory.getType().equals(handler.getClass())) {
        return factory;
      }
    }
    return null;
  }

  private void onTouchEvent(GestureHandler handler, MotionEvent motionEvent) {
    HandlerFactory handlerFactory = findFactoryForHandler(handler);
    EventDispatcher eventDispatcher = getReactApplicationContext()
            .getNativeModule(UIManagerModule.class)
            .getEventDispatcher();
    RNGestureHandlerEvent event = RNGestureHandlerEvent.obtain(handler, handlerFactory);
    eventDispatcher.dispatchEvent(event);
  }

  private void onStateChange(GestureHandler handler, int newState, int oldState) {
    HandlerFactory handlerFactory = findFactoryForHandler(handler);
    EventDispatcher eventDispatcher = getReactApplicationContext()
            .getNativeModule(UIManagerModule.class)
            .getEventDispatcher();
    RNGestureHandlerStateChangeEvent event = RNGestureHandlerStateChangeEvent.obtain(
            handler,
            oldState,
            handlerFactory);
    eventDispatcher.dispatchEvent(event);
  }

  private static void handleHitSlopProperty(GestureHandler handler, ReadableMap config) {
    if (config.getType(KEY_HIT_SLOP) == ReadableType.Number) {
      float hitSlop = PixelUtil.toPixelFromDIP(config.getDouble(KEY_HIT_SLOP));
      handler.setHitSlop(hitSlop, hitSlop, hitSlop, hitSlop);
    } else {
      ReadableMap hitSlop = config.getMap(KEY_HIT_SLOP);
      float left = 0, top = 0, right = 0, bottom = 0;
      if (hitSlop.hasKey(KEY_HIT_SLOP_HORIZONTAL)) {
        float horizontalPad = PixelUtil.toPixelFromDIP(hitSlop.getDouble(KEY_HIT_SLOP_HORIZONTAL));
        left = right = horizontalPad;
      }
      if (hitSlop.hasKey(KEY_HIT_SLOP_VERTICAL)) {
        float verticalPad = PixelUtil.toPixelFromDIP(hitSlop.getDouble(KEY_HIT_SLOP_VERTICAL));
        top = bottom = verticalPad;
      }
      if (hitSlop.hasKey(KEY_HIT_SLOP_LEFT)) {
        left  = PixelUtil.toPixelFromDIP(hitSlop.getDouble(KEY_HIT_SLOP_LEFT));
      }
      if (hitSlop.hasKey(KEY_HIT_SLOP_TOP)) {
        top = PixelUtil.toPixelFromDIP(hitSlop.getDouble(KEY_HIT_SLOP_TOP));
      }
      if (hitSlop.hasKey(KEY_HIT_SLOP_RIGHT)) {
        right = PixelUtil.toPixelFromDIP(hitSlop.getDouble(KEY_HIT_SLOP_RIGHT));
      }
      if (hitSlop.hasKey(KEY_HIT_SLOP_BOTTOM)) {
        bottom = PixelUtil.toPixelFromDIP(hitSlop.getDouble(KEY_HIT_SLOP_BOTTOM));
      }
      handler.setHitSlop(left, top, right, bottom);
    }
  }
}
