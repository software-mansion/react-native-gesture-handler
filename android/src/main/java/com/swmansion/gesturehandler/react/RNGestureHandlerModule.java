package com.swmansion.gesturehandler.react;

import android.app.Activity;
import android.content.Context;
import android.graphics.Point;
import android.util.Log;
import android.view.DragEvent;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.Nullable;

import com.facebook.react.ReactRootView;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.JSApplicationIllegalArgumentException;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableArray;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.ReadableType;
import com.facebook.react.bridge.WritableArray;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.bridge.WritableNativeArray;
import com.facebook.react.bridge.WritableNativeMap;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.common.ReactConstants;
import com.facebook.react.module.annotations.ReactModule;
import com.facebook.react.modules.i18nmanager.I18nUtil;
import com.facebook.react.uimanager.NativeViewHierarchyManager;
import com.facebook.react.uimanager.PixelUtil;
import com.facebook.react.uimanager.UIBlock;
import com.facebook.react.uimanager.UIManagerModule;
import com.facebook.react.uimanager.events.EventDispatcher;
import com.facebook.yoga.YogaDisplay;
import com.swmansion.gesturehandler.DragDropGestureHandler;
import com.swmansion.gesturehandler.DragGestureHandler;
import com.swmansion.gesturehandler.DragGestureUtils;
import com.swmansion.gesturehandler.DropGestureHandler;
import com.swmansion.gesturehandler.FlingGestureHandler;
import com.swmansion.gesturehandler.GestureHandler;
import com.swmansion.gesturehandler.LongPressGestureHandler;
import com.swmansion.gesturehandler.NativeViewGestureHandler;
import com.swmansion.gesturehandler.OnTouchEventListener;
import com.swmansion.gesturehandler.PanGestureHandler;
import com.swmansion.gesturehandler.PinchGestureHandler;
import com.swmansion.gesturehandler.RotationGestureHandler;
import com.swmansion.gesturehandler.TapGestureHandler;

import org.json.JSONArray;
import org.json.JSONException;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

import static com.swmansion.gesturehandler.DragGestureUtils.KEY_DATA;
import static com.swmansion.gesturehandler.DragGestureUtils.KEY_SOURCE_APP;
import static com.swmansion.gesturehandler.DragGestureUtils.KEY_TYPES;
import static com.swmansion.gesturehandler.GestureHandler.HIT_SLOP_NONE;
import static com.swmansion.gesturehandler.GestureHandler.STATE_END;

@ReactModule(name=RNGestureHandlerModule.MODULE_NAME)
public class RNGestureHandlerModule extends ReactContextBaseJavaModule {

  public static final String MODULE_NAME = "RNGestureHandlerModule";

  private static final String KEY_SHOULD_CANCEL_WHEN_OUTSIDE = "shouldCancelWhenOutside";
  private static final String KEY_ENABLED = "enabled";
  private static final String KEY_HIT_SLOP = "hitSlop";
  private static final String KEY_HIT_SLOP_LEFT = "left";
  private static final String KEY_HIT_SLOP_TOP = "top";
  private static final String KEY_HIT_SLOP_RIGHT = "right";
  private static final String KEY_HIT_SLOP_BOTTOM = "bottom";
  private static final String KEY_HIT_SLOP_VERTICAL = "vertical";
  private static final String KEY_HIT_SLOP_HORIZONTAL = "horizontal";
  private static final String KEY_HIT_SLOP_WIDTH = "width";
  private static final String KEY_HIT_SLOP_HEIGHT = "height";
  private static final String KEY_NATIVE_VIEW_SHOULD_ACTIVATE_ON_START = "shouldActivateOnStart";
  private static final String KEY_NATIVE_VIEW_DISALLOW_INTERRUPTION = "disallowInterruption";
  private static final String KEY_TAP_NUMBER_OF_TAPS = "numberOfTaps";
  private static final String KEY_TAP_MAX_DURATION_MS = "maxDurationMs";
  private static final String KEY_TAP_MAX_DELAY_MS = "maxDelayMs";
  private static final String KEY_TAP_MAX_DELTA_X = "maxDeltaX";
  private static final String KEY_TAP_MAX_DELTA_Y = "maxDeltaY";
  private static final String KEY_TAP_MAX_DIST = "maxDist";
  private static final String KEY_TAP_MIN_POINTERS = "minPointers";
  private static final String KEY_LONG_PRESS_MIN_DURATION_MS = "minDurationMs";
  private static final String KEY_LONG_PRESS_MAX_DIST = "maxDist";
  private static final String KEY_PAN_ACTIVE_OFFSET_X_START = "activeOffsetXStart";
  private static final String KEY_PAN_ACTIVE_OFFSET_X_END = "activeOffsetXEnd";
  private static final String KEY_PAN_FAIL_OFFSET_RANGE_X_START = "failOffsetXStart";
  private static final String KEY_PAN_FAIL_OFFSET_RANGE_X_END = "failOffsetXEnd";
  private static final String KEY_PAN_ACTIVE_OFFSET_Y_START = "activeOffsetYStart";
  private static final String KEY_PAN_ACTIVE_OFFSET_Y_END = "activeOffsetYEnd";
  private static final String KEY_PAN_FAIL_OFFSET_RANGE_Y_START = "failOffsetYStart";
  private static final String KEY_PAN_FAIL_OFFSET_RANGE_Y_END = "failOffsetYEnd";
  private static final String KEY_PAN_MIN_DIST = "minDist";
  private static final String KEY_PAN_MIN_VELOCITY = "minVelocity";
  private static final String KEY_PAN_MIN_VELOCITY_X = "minVelocityX";
  private static final String KEY_PAN_MIN_VELOCITY_Y = "minVelocityY";
  private static final String KEY_PAN_MIN_POINTERS = "minPointers";
  private static final String KEY_PAN_MAX_POINTERS = "maxPointers";
  private static final String KEY_PAN_AVG_TOUCHES = "avgTouches";
  private static final String KEY_NUMBER_OF_POINTERS = "numberOfPointers";
  private static final String KEY_DIRECTION = "direction";

  private abstract static class HandlerFactory<T extends GestureHandler>
          implements RNGestureHandlerEventDataExtractor<T> {

    public abstract Class<T> getType();

    public abstract String getName();

    public abstract T create(Context context);

    public void configure(T handler, ReadableMap config) {
      if (config.hasKey(KEY_SHOULD_CANCEL_WHEN_OUTSIDE)) {
        handler.setShouldCancelWhenOutside(config.getBoolean(KEY_SHOULD_CANCEL_WHEN_OUTSIDE));
      }
      if (config.hasKey(KEY_ENABLED)) {
        handler.setEnabled(config.getBoolean(KEY_ENABLED));
      }
      if (config.hasKey(KEY_HIT_SLOP)) {
        handleHitSlopProperty(handler, config);
      }
    }

    @Override
    public void extractEventData(T handler, WritableMap eventData) {
      eventData.putDouble("numberOfPointers", handler.getNumberOfPointers());
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
    public NativeViewGestureHandler create(Context context) {
      return new NativeViewGestureHandler();
    }

    @Override
    public void configure(NativeViewGestureHandler handler, ReadableMap config) {
      super.configure(handler, config);
      if (config.hasKey(KEY_NATIVE_VIEW_SHOULD_ACTIVATE_ON_START)) {
        handler.setShouldActivateOnStart(
                config.getBoolean(KEY_NATIVE_VIEW_SHOULD_ACTIVATE_ON_START));
      }
      if (config.hasKey(KEY_NATIVE_VIEW_DISALLOW_INTERRUPTION)) {
        handler.setDisallowInterruption(config.getBoolean(KEY_NATIVE_VIEW_DISALLOW_INTERRUPTION));
      }
    }

    @Override
    public void extractEventData(NativeViewGestureHandler handler, WritableMap eventData) {
      super.extractEventData(handler, eventData);
      eventData.putBoolean("pointerInside", handler.isWithinBounds());
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
    public TapGestureHandler create(Context context) {
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
      if (config.hasKey(KEY_TAP_MAX_DELTA_X)) {
        handler.setMaxDx(PixelUtil.toPixelFromDIP(config.getDouble(KEY_TAP_MAX_DELTA_X)));
      }
      if (config.hasKey(KEY_TAP_MAX_DELTA_Y)) {
        handler.setMaxDy(PixelUtil.toPixelFromDIP(config.getDouble(KEY_TAP_MAX_DELTA_Y)));
      }
      if (config.hasKey(KEY_TAP_MAX_DIST)) {
        handler.setMaxDist(PixelUtil.toPixelFromDIP(config.getDouble(KEY_TAP_MAX_DIST)));
      }
      if (config.hasKey(KEY_TAP_MIN_POINTERS)) {
        handler.setMinNumberOfPointers(config.getInt(KEY_TAP_MIN_POINTERS));
      }
    }

    @Override
    public void extractEventData(TapGestureHandler handler, WritableMap eventData) {
      super.extractEventData(handler, eventData);
      eventData.putDouble("x", PixelUtil.toDIPFromPixel(handler.getLastRelativePositionX()));
      eventData.putDouble("y", PixelUtil.toDIPFromPixel(handler.getLastRelativePositionY()));
      eventData.putDouble("absoluteX", PixelUtil.toDIPFromPixel(handler.getLastAbsolutePositionX()));
      eventData.putDouble("absoluteY", PixelUtil.toDIPFromPixel(handler.getLastAbsolutePositionY()));
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
    public LongPressGestureHandler create(Context context) {
      return new LongPressGestureHandler(context);
    }

    @Override
    public void configure(LongPressGestureHandler handler, ReadableMap config) {
      super.configure(handler, config);
      if (config.hasKey(KEY_LONG_PRESS_MIN_DURATION_MS)) {
        handler.setMinDurationMs(config.getInt(KEY_LONG_PRESS_MIN_DURATION_MS));
      }
      if (config.hasKey(KEY_LONG_PRESS_MAX_DIST)) {
        handler.setMaxDist(PixelUtil.toPixelFromDIP(config.getDouble(KEY_LONG_PRESS_MAX_DIST)));
      }
    }

    @Override
    public void extractEventData(LongPressGestureHandler handler, WritableMap eventData) {
      super.extractEventData(handler, eventData);
      eventData.putDouble("x", PixelUtil.toDIPFromPixel(handler.getLastRelativePositionX()));
      eventData.putDouble("y", PixelUtil.toDIPFromPixel(handler.getLastRelativePositionY()));
      eventData.putDouble("absoluteX", PixelUtil.toDIPFromPixel(handler.getLastAbsolutePositionX()));
      eventData.putDouble("absoluteY", PixelUtil.toDIPFromPixel(handler.getLastAbsolutePositionY()));
    }
  }

  private static abstract class PanGestureHandlerBaseFactory<T extends PanGestureHandler> extends HandlerFactory<T> {
    @Override
    public void configure(T handler, ReadableMap config) {
      super.configure(handler, config);
      boolean hasCustomActivationCriteria = false;
      if(config.hasKey(KEY_PAN_ACTIVE_OFFSET_X_START)) {
        handler.setActiveOffsetXStart(PixelUtil.toPixelFromDIP(config.getDouble(KEY_PAN_ACTIVE_OFFSET_X_START)));
        hasCustomActivationCriteria = true;
      }
      if(config.hasKey(KEY_PAN_ACTIVE_OFFSET_X_END)) {
        handler.setActiveOffsetXEnd(PixelUtil.toPixelFromDIP(config.getDouble(KEY_PAN_ACTIVE_OFFSET_X_END)));
        hasCustomActivationCriteria = true;
      }
      if(config.hasKey(KEY_PAN_FAIL_OFFSET_RANGE_X_START)) {
        handler.setFailOffsetXStart(PixelUtil.toPixelFromDIP(config.getDouble(KEY_PAN_FAIL_OFFSET_RANGE_X_START)));
        hasCustomActivationCriteria = true;
      }
      if(config.hasKey(KEY_PAN_FAIL_OFFSET_RANGE_X_END)) {
        handler.setFailOffsetXEnd(PixelUtil.toPixelFromDIP(config.getDouble(KEY_PAN_FAIL_OFFSET_RANGE_X_END)));
        hasCustomActivationCriteria = true;
      }
      if(config.hasKey(KEY_PAN_ACTIVE_OFFSET_Y_START)) {
        handler.setActiveOffsetYStart(PixelUtil.toPixelFromDIP(config.getDouble(KEY_PAN_ACTIVE_OFFSET_Y_START)));
        hasCustomActivationCriteria = true;
      }
      if(config.hasKey(KEY_PAN_ACTIVE_OFFSET_Y_END)) {
        handler.setActiveOffsetYEnd(PixelUtil.toPixelFromDIP(config.getDouble(KEY_PAN_ACTIVE_OFFSET_Y_END)));
        hasCustomActivationCriteria = true;
      }
      if(config.hasKey(KEY_PAN_FAIL_OFFSET_RANGE_Y_START)) {
        handler.setFailOffsetYStart(PixelUtil.toPixelFromDIP(config.getDouble(KEY_PAN_FAIL_OFFSET_RANGE_Y_START)));
        hasCustomActivationCriteria = true;
      }
      if(config.hasKey(KEY_PAN_FAIL_OFFSET_RANGE_Y_END)) {
        handler.setFailOffsetYEnd(PixelUtil.toPixelFromDIP(config.getDouble(KEY_PAN_FAIL_OFFSET_RANGE_Y_END)));
        hasCustomActivationCriteria = true;
      }

      if (config.hasKey(KEY_PAN_MIN_VELOCITY)) {
        // This value is actually in DPs/ms, but we can use the same function as for converting
        // from DPs to pixels as the unit we're converting is in the numerator
        handler.setMinVelocity(PixelUtil.toPixelFromDIP(config.getDouble(KEY_PAN_MIN_VELOCITY)));
        hasCustomActivationCriteria = true;
      }
      if (config.hasKey(KEY_PAN_MIN_VELOCITY_X)) {
        handler.setMinVelocityX(PixelUtil.toPixelFromDIP(config.getDouble(KEY_PAN_MIN_VELOCITY_X)));
        hasCustomActivationCriteria = true;
      }
      if (config.hasKey(KEY_PAN_MIN_VELOCITY_Y)) {
        handler.setMinVelocityY(PixelUtil.toPixelFromDIP(config.getDouble(KEY_PAN_MIN_VELOCITY_Y)));
        hasCustomActivationCriteria = true;
      }

      // PanGestureHandler sets minDist by default, if there are custom criteria specified we want
      // to reset that setting and use provided criteria instead.
      if (config.hasKey(KEY_PAN_MIN_DIST)) {
        handler.setMinDist(PixelUtil.toPixelFromDIP(config.getDouble(KEY_PAN_MIN_DIST)));
      } else if (hasCustomActivationCriteria) {
        handler.setMinDist(Float.MAX_VALUE);
      }

      if (config.hasKey(KEY_PAN_MIN_POINTERS)) {
        handler.setMinPointers(config.getInt(KEY_PAN_MIN_POINTERS));
      }
      if (config.hasKey(KEY_PAN_MAX_POINTERS)) {
        handler.setMaxPointers(config.getInt(KEY_PAN_MAX_POINTERS));
      }
      if (config.hasKey(KEY_PAN_AVG_TOUCHES)) {
        handler.setAverageTouches(config.getBoolean(KEY_PAN_AVG_TOUCHES));
      }
    }

    @Override
    public void extractEventData(T handler, WritableMap eventData) {
      super.extractEventData(handler, eventData);
      eventData.putDouble("x", PixelUtil.toDIPFromPixel(handler.getLastRelativePositionX()));
      eventData.putDouble("y", PixelUtil.toDIPFromPixel(handler.getLastRelativePositionY()));
      eventData.putDouble("absoluteX", PixelUtil.toDIPFromPixel(handler.getLastAbsolutePositionX()));
      eventData.putDouble("absoluteY", PixelUtil.toDIPFromPixel(handler.getLastAbsolutePositionY()));
      eventData.putDouble("translationX", PixelUtil.toDIPFromPixel(handler.getTranslationX()));
      eventData.putDouble("translationY", PixelUtil.toDIPFromPixel(handler.getTranslationY()));
      eventData.putDouble("velocityX", PixelUtil.toDIPFromPixel(handler.getVelocityX()));
      eventData.putDouble("velocityY", PixelUtil.toDIPFromPixel(handler.getVelocityY()));
    }
  }

  private static class PanGestureHandlerFactory extends PanGestureHandlerBaseFactory<PanGestureHandler> {
    @Override
    public Class<PanGestureHandler> getType() {
      return PanGestureHandler.class;
    }

    @Override
    public String getName() {
      return "PanGestureHandler";
    }

    @Override
    public PanGestureHandler create(Context context) {
      return new PanGestureHandler(context);
    }
  }

  private static abstract class DragDropGestureHandlerFactory<T extends DragDropGestureHandler> extends PanGestureHandlerBaseFactory<T> {


    private static class MapResolver implements DragGestureUtils.DataResolver<ReadableMap, ReadableArray> {

      private ReadableMap mSource;
      private final ReactApplicationContext mContext;

      MapResolver(ReactApplicationContext context) {
        mContext = context;
        mSource = null;
      }
      MapResolver(ReactApplicationContext context, ReadableMap map) {
        mContext = context;
        mSource = map;
      }

      @Override
      public String stringify(DragGestureHandler<ReadableMap, ReadableArray>[] handlers) {
        JSONArray data = new JSONArray();
        ReadableMap in;
        WritableMap out;
        for (DragGestureHandler<ReadableMap, ReadableArray> handler : handlers) {
          in = handler.getDataResolver().data();
          if (in != null) {
            out = new WritableNativeMap();
            out.merge(in);
            out.putInt("target", handler.getTag());
            try {
              data.put(JSONUtil.convertMapToJson(out));
            } catch (JSONException e) {
              Log.e(ReactConstants.TAG, "[GESTURE HANDLER] Could not parse drag event data to JSON, raw data: " + out, e);
            }
          }
        }
        return data.toString();
      }

      @Override
      public ReadableArray parse(String sources) {
        try {
          return JSONUtil.convertJsonToArray(new JSONArray(sources));
        } catch (JSONException e) {
          Log.e(ReactConstants.TAG, "[GESTURE HANDLER] Could not parse drag event data to JSON, raw data: " + sources, e);
          WritableMap map = Arguments.createMap();
          WritableArray out = Arguments.createArray();
          map.putString("rawData", sources);
          out.pushMap(map);
          return out;
        }
      }

      @Nullable
      @Override
      public ReadableMap data() {
        return mSource;
      }

      @Override
      public Activity getActivity() {
        return mContext.getCurrentActivity();
      }
    }

    private static class ReactDragGestureHandler extends DragGestureHandler<ReadableMap, ReadableArray> {
      ReactDragGestureHandler(Context context) {
        super(context);
        setDataResolver(new MapResolver((ReactApplicationContext) context));
        setShadowConfig(new MultiDragShadowBuilder.Config());
      }

      @Override
      public DragGestureHandler<ReadableMap, ReadableArray> setShadowConfig(MultiDragShadowBuilder.Config config) {
        config.isRTL = I18nUtil.getInstance().isRTL(getContext());
        return super.setShadowConfig(config);
      }

      @Override
      public String getDebugTag() {
        return ReactConstants.TAG;
      }

      /**
       * This is used to handle UI changes natively for responsiveness in the case which
       * {@link DragGestureHandler#setDragMode(int)} was set to {@link DragGestureUtils#DRAG_MODE_MOVE},
       * making the drag target seem as if it were moved from it's parent after the drop has occurred.
       * JS is still in charge of actually removing the view.
       */
      @Override
      public void onDrop() {
        super.onDrop();
        if (getDragMode() == DragGestureUtils.DRAG_MODE_MOVE) {
          ReactApplicationContext context = ((ReactApplicationContext) getContext());
          final UIManagerModule uiManager = context.getNativeModule(UIManagerModule.class);
          View[] views = getViews();
          final int[] tags = new int[views.length];
          for (int i = 0; i < views.length; i++) {
            tags[i] = views[i].getId();
          }
          context.runOnNativeModulesQueueThread(new Runnable() {
            @Override
            public void run() {
              for (int tag: tags) {
                uiManager.getUIImplementation()
                        .resolveShadowNode(tag)
                        .setDisplay(YogaDisplay.NONE);
              }
            }
          });
        }
      }
    }

    private static class DragGestureHandlerFactory extends DragDropGestureHandlerFactory<ReactDragGestureHandler> {

      private static final String KEY_SHADOW_VIEW_TAG = "shadowViewTag";
      private static final String KEY_DRAG_MODE = "dragMode";
      private static final String DRAG_MODE_MOVE = "move";
      private static final String DRAG_MODE_MOVE_RESTORE = "move-restore";
      private static final String DRAG_MODE_COPY = "copy";
      private static final String DRAG_MODE_NONE = "none";
      private static final String KEY_DRAG_SHADOW_CONFIG = "shadowConfig";
      private static final String KEY_DRAG_SHADOW_CONFIG_MARGIN = "margin";
      private static final String KEY_DRAG_SHADOW_CONFIG_OFFSET = "offset";
      private static final String KEY_DRAG_SHADOW_CONFIG_OPACITY = "opacity";
      private static final String KEY_DRAG_SHADOW_CONFIG_ENABLED = "multiShadowEnabled";

      @Override
      public Class<ReactDragGestureHandler> getType() {
        return ReactDragGestureHandler.class;
      }

      @Override
      public String getName() {
        return "DragGestureHandler";
      }

      @Override
      public ReactDragGestureHandler create(Context context) {
        return new ReactDragGestureHandler(context);
      }

      @Override
      public void configure(final ReactDragGestureHandler handler, ReadableMap config) {
        super.configure(handler, config);
        ReadableType type;
        if(config.hasKey(KEY_SHADOW_VIEW_TAG)) {
          type = config.getType(KEY_SHADOW_VIEW_TAG);
          if (type == ReadableType.Null) {
            handler.setShadowBuilderView(null);
          } else if (type == ReadableType.Number) {
            final int shadowViewTag = config.getInt(KEY_SHADOW_VIEW_TAG);
            ((ReactApplicationContext) handler.getContext())
                    .getNativeModule(UIManagerModule.class)
                    .addUIBlock(new UIBlock() {
                      @Override
                      public void execute(NativeViewHierarchyManager nativeViewHierarchyManager) {
                        View view = nativeViewHierarchyManager.resolveView(shadowViewTag);
                        handler.setShadowBuilderView(view);
                      }
                    });
          }
        }
        if (config.hasKey(KEY_DRAG_MODE)) {
          type = config.getType(KEY_DRAG_MODE);
          if (type == ReadableType.Number) {
            handler.setDragMode(config.getInt(KEY_DRAG_MODE));
          } else if (type == ReadableType.String) {
            int mode;
            switch (config.getString(KEY_DRAG_MODE)) {
              case DRAG_MODE_MOVE:
                mode = DragGestureUtils.DRAG_MODE_MOVE;
                break;
              case DRAG_MODE_MOVE_RESTORE:
                mode = DragGestureUtils.DRAG_MODE_MOVE_RESTORE;
                break;
              case DRAG_MODE_COPY:
                mode = DragGestureUtils.DRAG_MODE_COPY;
                break;
              case DRAG_MODE_NONE:
                mode = DragGestureUtils.DRAG_MODE_NONE;
                break;
              default:
                throw new JSApplicationIllegalArgumentException(
                  String.format("[GESTURE HANDLER] received bad %s prop of value %s",
                    KEY_DRAG_MODE, config.getString(KEY_DRAG_MODE)));
            }
            handler.setDragMode(mode);
          }
        }
        if (config.hasKey(KEY_DRAG_SHADOW_CONFIG)) {
          ReadableMap shadowConfigIn = config.getMap(KEY_DRAG_SHADOW_CONFIG);
          DragGestureHandler.MultiDragShadowBuilder.Config shadowConfig = new DragGestureHandler.MultiDragShadowBuilder.Config();
          if (shadowConfigIn.hasKey(KEY_DRAG_SHADOW_CONFIG_ENABLED)) {
            shadowConfig.multiShadowEnabled = shadowConfigIn.getBoolean(KEY_DRAG_SHADOW_CONFIG_ENABLED);
          }
          if (shadowConfigIn.hasKey(KEY_DRAG_SHADOW_CONFIG_MARGIN)) {
            ReadableArray marginIn = shadowConfigIn.getArray(KEY_DRAG_SHADOW_CONFIG_MARGIN);
            shadowConfig.margin = new Point(
                    (int) PixelUtil.toPixelFromDIP(marginIn.getInt(0)),
                    (int) PixelUtil.toPixelFromDIP(marginIn.getInt(1)));
          }
          if (shadowConfigIn.hasKey(KEY_DRAG_SHADOW_CONFIG_OFFSET)) {
            ReadableArray offsetIn = shadowConfigIn.getArray(KEY_DRAG_SHADOW_CONFIG_OFFSET);
            shadowConfig.offset = new Point(
                    (int) PixelUtil.toPixelFromDIP(offsetIn.getInt(0)),
                    (int) PixelUtil.toPixelFromDIP(offsetIn.getInt(1)));
          }
          if (shadowConfigIn.hasKey(KEY_DRAG_SHADOW_CONFIG_OPACITY)) {
            ReadableArray opacityRange = shadowConfigIn.getArray(KEY_DRAG_SHADOW_CONFIG_OPACITY);
            shadowConfig.minAlpha = (float) opacityRange.getDouble(0);
            shadowConfig.maxAlpha = (float) opacityRange.getDouble(1);
          }
          handler.setShadowConfig(shadowConfig);
        }
      }
    }

    private static class ReactDropGestureHandler extends DropGestureHandler<ReadableMap, ReadableArray> {
      ReactDropGestureHandler(Context context) {
        super(context);
        setDataResolver(new MapResolver((ReactApplicationContext) context));
      }
    }

    private static class DropGestureHandlerFactory extends DragDropGestureHandlerFactory<ReactDropGestureHandler> {

      private static final String KEY_DRAG_DATA_PASS_PROPS = "nativeProps";

      @Override
      public Class<ReactDropGestureHandler> getType() {
        return ReactDropGestureHandler.class;
      }

      @Override
      public String getName() {
        return "DropGestureHandler";
      }

      @Override
      public ReactDropGestureHandler create(Context context) {
        return new ReactDropGestureHandler(context);
      }

      @Override
      public void extractEventData(ReactDropGestureHandler handler, WritableMap eventData) {
        super.extractEventData(handler, eventData);
        ReadableArray data = handler.getData();
        ReadableMap dataFragment;
        final WritableMap props = new WritableNativeMap();
        if (data != null && handler.getState() == STATE_END && handler.getDropTarget() > 0) {
          //  merge props
          for (int i = data.size() - 1; i >= 0; i--) {
            dataFragment = data.getMap(i);
            if (dataFragment != null && dataFragment.hasKey(KEY_DRAG_DATA_PASS_PROPS) &&
                    dataFragment.getType(KEY_DRAG_DATA_PASS_PROPS) == ReadableType.Map) {
              props.merge(dataFragment.getMap(KEY_DRAG_DATA_PASS_PROPS));
            }
          }
          if (props.keySetIterator().hasNextKey()) {
            final int tag = handler.getDropTarget();
            final ReactApplicationContext context = ((ReactApplicationContext) handler.getContext());
            context.runOnUiQueueThread(new Runnable() {
              @Override
              public void run() {
                UIManagerModule uiManagerModule = context.getNativeModule(UIManagerModule.class);
                uiManagerModule.synchronouslyUpdateViewOnUIThread(tag, props);
              }
            });
          }
        }
        eventData.putArray("data", data);
        String sourceID = handler.getLastSourceAppID();
        if (sourceID != null && !sourceID.equals(handler.getContext().getPackageName())) {
          eventData.putString(KEY_SOURCE_APP, sourceID);
        }
      }
    }

    @Override
    public void configure(T handler, ReadableMap config) {
      super.configure(handler, config);
      if(config.hasKey(KEY_TYPES)) {
        ArrayList<Integer> types = new ArrayList<>();
        ReadableType readableType = config.getType(KEY_TYPES);
        if (readableType == ReadableType.Number) {
          types.add(config.getInt(KEY_TYPES));
        } else if (readableType == ReadableType.Array) {
          ReadableArray typeArr = config.getArray(KEY_TYPES);
          if (typeArr != null) {
            for (int i = 0; i < typeArr.size(); i++) {
              types.add(typeArr.getInt(i));
            }
          }
        }
        handler.setTypes(types);
      }

      if(config.hasKey(KEY_DATA) && config.getType(KEY_DATA) == ReadableType.Map) {
        handler.setDataResolver(
                new MapResolver(
                        (ReactApplicationContext) handler.getContext(),
                        config.getMap(KEY_DATA)
                )
        );
      }
    }

    @Override
    public void extractEventData(T handler, WritableMap eventData) {
      super.extractEventData(handler, eventData);
      eventData.putInt("dragState", handler.getDragAction());
      eventData.putInt("dropTarget", handler.getDropTarget());
      eventData.putInt("dragTarget", handler.getDragTarget());
      int[] dragTargets = handler.getDragTargets();
      if (dragTargets != null && dragTargets.length > 1) {
        WritableArray dragTargetsArray = new WritableNativeArray();
        for (int tag: dragTargets) {
          dragTargetsArray.pushInt(tag);
        }
        eventData.putArray("dragTargets", dragTargetsArray);
      }
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
    public PinchGestureHandler create(Context context) {
      return new PinchGestureHandler();
    }

    @Override
    public void extractEventData(PinchGestureHandler handler, WritableMap eventData) {
      super.extractEventData(handler, eventData);
      eventData.putDouble("scale", handler.getScale());
      eventData.putDouble("focalX", PixelUtil.toDIPFromPixel(handler.getFocalPointX()));
      eventData.putDouble("focalY", PixelUtil.toDIPFromPixel(handler.getFocalPointY()));
      eventData.putDouble("velocity", handler.getVelocity());
    }
  }

  private static class FlingGestureHandlerFactory extends HandlerFactory<FlingGestureHandler> {
    @Override
    public Class<FlingGestureHandler> getType() {
      return FlingGestureHandler.class;
    }

    @Override
    public String getName() {
      return "FlingGestureHandler";
    }

    @Override
    public FlingGestureHandler create(Context context) {
      return new FlingGestureHandler();
    }

    @Override
    public void configure(FlingGestureHandler handler, ReadableMap config) {
      super.configure(handler, config);
      if (config.hasKey(KEY_NUMBER_OF_POINTERS)) {
        handler.setNumberOfPointersRequired(config.getInt(KEY_NUMBER_OF_POINTERS));
      }
      if (config.hasKey(KEY_DIRECTION)) {
        handler.setDirection(config.getInt(KEY_DIRECTION));
      }
    }
    @Override
    public void extractEventData(FlingGestureHandler handler, WritableMap eventData) {
      super.extractEventData(handler, eventData);
      eventData.putDouble("x", PixelUtil.toDIPFromPixel(handler.getLastRelativePositionX()));
      eventData.putDouble("y", PixelUtil.toDIPFromPixel(handler.getLastRelativePositionY()));
      eventData.putDouble("absoluteX", PixelUtil.toDIPFromPixel(handler.getLastAbsolutePositionX()));
      eventData.putDouble("absoluteY", PixelUtil.toDIPFromPixel(handler.getLastAbsolutePositionY()));
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
    public RotationGestureHandler create(Context context) {
      return new RotationGestureHandler();
    }

    @Override
    public void extractEventData(RotationGestureHandler handler, WritableMap eventData) {
      super.extractEventData(handler, eventData);
      eventData.putDouble("rotation", handler.getRotation());
      eventData.putDouble("anchorX", PixelUtil.toDIPFromPixel(handler.getAnchorX()));
      eventData.putDouble("anchorY", PixelUtil.toDIPFromPixel(handler.getAnchorY()));
      eventData.putDouble("velocity", handler.getVelocity());
    }
  }

  private OnTouchEventListener mEventListener = new OnTouchEventListener() {
    @Override
    public void onTouchEvent(GestureHandler handler, MotionEvent event) {
      RNGestureHandlerModule.this.onTouchEvent(handler, event);
    }

    @Override
    public void onDragEvent(GestureHandler handler, DragEvent event) {
      RNGestureHandlerModule.this.onDragEvent(handler, event);
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
          new RotationGestureHandlerFactory(),
          new FlingGestureHandlerFactory(),
          new DragDropGestureHandlerFactory.DragGestureHandlerFactory(),
          new DragDropGestureHandlerFactory.DropGestureHandlerFactory(),
  };
  private final RNGestureHandlerRegistry mRegistry;

  private RNGestureHandlerInteractionManager mInteractionManager =
          new RNGestureHandlerInteractionManager();
  private List<RNGestureHandlerRootHelper> mRoots = new ArrayList<>();
  private List<Integer> mEnqueuedRootViewInit = new ArrayList<>();

  public RNGestureHandlerModule(ReactApplicationContext reactContext) {
    super(reactContext);
    mRegistry = new RNGestureHandlerRegistry(reactContext);
  }

  @Override
  public String getName() {
    return MODULE_NAME;
  }

  @ReactMethod
  public void createGestureHandler(
          String handlerName,
          int handlerTag,
          ReadableMap config) {
    for (int i = 0; i < mHandlerFactories.length; i++) {
      HandlerFactory handlerFactory = mHandlerFactories[i];
      if (handlerFactory.getName().equals(handlerName)) {
        GestureHandler handler = handlerFactory.create(getReactApplicationContext());
        handler.setTag(handlerTag);
        handler.setOnTouchEventListener(mEventListener);
        mRegistry.registerHandler(handler);
        mInteractionManager.configureInteractions(handler, config);
        handlerFactory.configure(handler, config);
        return;
      }
    }
    throw new JSApplicationIllegalArgumentException("Invalid handler name " + handlerName);
  }

  @ReactMethod
  public void attachGestureHandler(int handlerTag, int viewTag) {
    tryInitializeHandlerForReactRootView(viewTag);
    if (!mRegistry.attachHandlerToView(handlerTag, viewTag)) {
      throw new JSApplicationIllegalArgumentException(
              "Handler with tag " + handlerTag + " does not exists");
    }
  }

  @ReactMethod
  public void updateGestureHandler(
          int handlerTag,
          ReadableMap config) {
    GestureHandler handler = mRegistry.getHandler(handlerTag);
    if (handler != null) {
      HandlerFactory factory = findFactoryForHandler(handler);
      if (factory != null) {
        mInteractionManager.dropRelationsForHandlerWithTag(handlerTag);
        mInteractionManager.configureInteractions(handler, config);
        factory.configure(handler, config);
      }
    }
  }

  @ReactMethod
  public void dropGestureHandler(int handlerTag) {
    mInteractionManager.dropRelationsForHandlerWithTag(handlerTag);
    mRegistry.dropHandler(handlerTag);
  }

  @ReactMethod
  public void handleSetJSResponder(int viewTag, boolean blockNativeResponder) {
    if (mRegistry != null) {
      RNGestureHandlerRootHelper rootView = findRootHelperForViewAncestor(viewTag);
      if (rootView != null) {
        rootView.handleSetJSResponder(viewTag, blockNativeResponder);
      }
    }
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
    ), "Direction", MapBuilder.of(
            "RIGHT", GestureHandler.DIRECTION_RIGHT,
            "LEFT", GestureHandler.DIRECTION_LEFT,
            "UP", GestureHandler.DIRECTION_UP,
            "DOWN", GestureHandler.DIRECTION_DOWN
    ), "DragState", MapBuilder.of(
            "BEGAN", DragEvent.ACTION_DRAG_STARTED,
            "ACTIVE", DragEvent.ACTION_DRAG_LOCATION,
            "DROP", DragEvent.ACTION_DROP,
            "END", DragEvent.ACTION_DRAG_ENDED,
            "ENTERED", DragEvent.ACTION_DRAG_ENTERED,
            "EXITED", DragEvent.ACTION_DRAG_EXITED
    ), "DragMode", MapBuilder.of(
            "MOVE", DragGestureUtils.DRAG_MODE_MOVE,
            "MOVE_RESTORE", DragGestureUtils.DRAG_MODE_MOVE_RESTORE,
            "COPY", DragGestureUtils.DRAG_MODE_COPY,
            "NONE", DragGestureUtils.DRAG_MODE_NONE
    ));
  }

  public RNGestureHandlerRegistry getRegistry() {
    return mRegistry;
  }


  @Override
  public void onCatalystInstanceDestroy() {
    mRegistry.dropAllHandlers();
    mInteractionManager.reset();
    synchronized (mRoots) {
      while (!mRoots.isEmpty()) {
        int sizeBefore = mRoots.size();
        RNGestureHandlerRootHelper root = mRoots.get(0);
        ViewGroup reactRootView = root.getRootView();
        if (reactRootView instanceof RNGestureHandlerEnabledRootView) {
          ((RNGestureHandlerEnabledRootView) reactRootView).tearDown();
        } else {
          root.tearDown();
        }
        if (mRoots.size() >= sizeBefore) {
          throw new IllegalStateException("Expected root helper to get unregistered while tearing down");
        }
      }
    }
    super.onCatalystInstanceDestroy();
  }

  private void tryInitializeHandlerForReactRootView(int ancestorViewTag) {
    UIManagerModule uiManager = getReactApplicationContext().getNativeModule(UIManagerModule.class);
    final int rootViewTag = uiManager.resolveRootTagFromReactTag(ancestorViewTag);
    if (rootViewTag < 1) {
      throw new JSApplicationIllegalArgumentException("Could find root view for a given ancestor with tag "
              + ancestorViewTag);
    }
    synchronized (mRoots) {
      for (int i = 0; i < mRoots.size(); i++) {
        RNGestureHandlerRootHelper root = mRoots.get(i);
        ViewGroup rootView = root.getRootView();
        if (rootView instanceof ReactRootView && ((ReactRootView) rootView).getRootViewTag() == rootViewTag) {
          // we have found root helper registered for a given react root, we don't need to
          // initialize a new one then
          return;
        }
      }
    }
    synchronized (mEnqueuedRootViewInit) {
      if (mEnqueuedRootViewInit.contains(rootViewTag)) {
        // root view initialization already enqueued -> we skip
        return;
      }
      mEnqueuedRootViewInit.add(rootViewTag);
    }
    // root helper for a given root tag has not been found, we may wat to check if the root view is
    // an instance of RNGestureHandlerEnabledRootView and then initialize gesture handler with it
    uiManager.addUIBlock(new UIBlock() {
      @Override
      public void execute(NativeViewHierarchyManager nativeViewHierarchyManager) {
        View view = nativeViewHierarchyManager.resolveView(rootViewTag);
        if (view instanceof RNGestureHandlerEnabledRootView) {
          ((RNGestureHandlerEnabledRootView) view).initialize();
        } else {
          // Seems like the root view is something else than RNGestureHandlerEnabledRootView, this
          // is fine though as long as gestureHandlerRootHOC is used in JS
          // FIXME: check and warn about gestureHandlerRootHOC
        }
        synchronized (mEnqueuedRootViewInit) {
          mEnqueuedRootViewInit.remove(new Integer(rootViewTag));
        }
      }
    });
  }

  public void registerRootHelper(RNGestureHandlerRootHelper root) {
    synchronized (mRoots) {
      if (mRoots.contains(root)) {
        throw new IllegalStateException("Root helper" + root + " already registered");
      }
      mRoots.add(root);
    }
  }

  public void unregisterRootHelper(RNGestureHandlerRootHelper root) {
    synchronized (mRoots) {
      mRoots.remove(root);
    }
  }


  private @Nullable RNGestureHandlerRootHelper findRootHelperForViewAncestor(int viewTag) {
    UIManagerModule uiManager = getReactApplicationContext().getNativeModule(UIManagerModule.class);
    int rootViewTag = uiManager.resolveRootTagFromReactTag(viewTag);
    if (rootViewTag < 1) {
      return null;
    }
    synchronized (mRoots) {
      for (int i = 0; i < mRoots.size(); i++) {
        RNGestureHandlerRootHelper root = mRoots.get(i);
        ViewGroup rootView = root.getRootView();
        if (rootView instanceof ReactRootView && ((ReactRootView) rootView).getRootViewTag() == rootViewTag) {
          return root;
        }
      }
    }
    return null;
  }

  private @Nullable
  HandlerFactory findFactoryForHandler(GestureHandler handler) {
    for (int i = 0; i < mHandlerFactories.length; i++) {
      HandlerFactory factory = mHandlerFactories[i];
      if (factory.getType().equals(handler.getClass())) {
        return factory;
      }
    }
    return null;
  }

  private void onTouchEvent(GestureHandler handler, MotionEvent motionEvent) {
    if (handler.getTag() < 0) {
      // root containers use negative tags, we don't need to dispatch events for them to the JS
      return;
    }
    if (handler.getState() == GestureHandler.STATE_ACTIVE) {
      HandlerFactory handlerFactory = findFactoryForHandler(handler);
      EventDispatcher eventDispatcher = getReactApplicationContext()
              .getNativeModule(UIManagerModule.class)
              .getEventDispatcher();
      RNGestureHandlerEvent event = RNGestureHandlerEvent.obtain(handler, handlerFactory);
      eventDispatcher.dispatchEvent(event);
    }
  }

  private void onDragEvent(GestureHandler handler, DragEvent dragEvent) {
    if (handler.getTag() < 0) {
      // root containers use negative tags, we don't need to dispatch events for them to the JS
      return;
    }
    if (handler.getState() == GestureHandler.STATE_ACTIVE) {
      HandlerFactory handlerFactory = findFactoryForHandler(handler);
      EventDispatcher eventDispatcher = getReactApplicationContext()
              .getNativeModule(UIManagerModule.class)
              .getEventDispatcher();
      RNGestureHandlerEvent event = RNGestureHandlerEvent.obtain(handler, handlerFactory);
      eventDispatcher.dispatchEvent(event);
    }
  }

  private void onStateChange(GestureHandler handler, int newState, int oldState) {
    if (handler.getTag() < 0) {
      // root containers use negative tags, we don't need to dispatch events for them to the JS
      return;
    }
    HandlerFactory handlerFactory = findFactoryForHandler(handler);
    EventDispatcher eventDispatcher = getReactApplicationContext()
            .getNativeModule(UIManagerModule.class)
            .getEventDispatcher();
    RNGestureHandlerStateChangeEvent event = RNGestureHandlerStateChangeEvent.obtain(
            handler,
            newState,
            oldState,
            handlerFactory);
    eventDispatcher.dispatchEvent(event);
  }

  private static void handleHitSlopProperty(GestureHandler handler, ReadableMap config) {
    if (config.getType(KEY_HIT_SLOP) == ReadableType.Number) {
      float hitSlop = PixelUtil.toPixelFromDIP(config.getDouble(KEY_HIT_SLOP));
      handler.setHitSlop(hitSlop, hitSlop, hitSlop, hitSlop, HIT_SLOP_NONE, HIT_SLOP_NONE);
    } else {
      ReadableMap hitSlop = config.getMap(KEY_HIT_SLOP);
      float left = HIT_SLOP_NONE, top = HIT_SLOP_NONE, right = HIT_SLOP_NONE, bottom = HIT_SLOP_NONE;
      float width = HIT_SLOP_NONE, height = HIT_SLOP_NONE;
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
      if (hitSlop.hasKey(KEY_HIT_SLOP_WIDTH)) {
        width = PixelUtil.toPixelFromDIP(hitSlop.getDouble(KEY_HIT_SLOP_WIDTH));
      }
      if (hitSlop.hasKey(KEY_HIT_SLOP_HEIGHT)) {
        height = PixelUtil.toPixelFromDIP(hitSlop.getDouble(KEY_HIT_SLOP_HEIGHT));
      }
      handler.setHitSlop(left, top, right, bottom, width, height);
    }
  }
}
