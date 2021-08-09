package com.swmansion.gesturehandler.react;

import android.view.View;

import androidx.annotation.NonNull;

import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;

public class RNGestureHandlerEventReceiverViewManager extends SimpleViewManager<View> {
    @NonNull
    @Override
    public String getName() {
        return "RNGestureHandlerEventReceiver";
    }

    @NonNull
    @Override
    protected View createViewInstance(@NonNull ThemedReactContext reactContext) {
        return new View(reactContext);
    }
}
