package com.swmansion.gesturehandler.react;

import android.util.Log;

import androidx.annotation.NonNull;

import com.facebook.react.bridge.UiThreadUtil;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.ViewGroupManager;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.facebook.react.views.view.ReactViewGroup;
import com.swmansion.gesturehandler.DragGestureHandler;

public class RNDragShadowViewManager extends ViewGroupManager<RNDragShadowViewManager.RNDragShadowView> {

    private static final String REACT_CLASS = "GestureHandlerDragShadowView";

    static class RNDragShadowView extends ReactViewGroup {
        private int mTag;
        RNDragShadowView(ThemedReactContext context) {
            super(context);
        }

        void setDragGestureHandlerTag(int tag) {
            mTag = tag;
        }

        void updateDragShadow() {
            ThemedReactContext context = (ThemedReactContext) getContext();
            RNGestureHandlerRegistry registry = context.getNativeModule(RNGestureHandlerModule.class).getRegistry();
            final DragGestureHandler handler = (DragGestureHandler) registry.getHandler(mTag);
            if (handler != null) {
                if (UiThreadUtil.isOnUiThread()) {
                    handler.setShadowBuilderView(this);
                } else {
                    UiThreadUtil.runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            handler.setShadowBuilderView(RNDragShadowView.this);
                        }
                    });
                }
            }
        }
    }

    @NonNull
    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @NonNull
    @Override
    protected RNDragShadowView createViewInstance(@NonNull ThemedReactContext reactContext) {
        return new RNDragShadowView(reactContext);
    }

    @Override
    protected void onAfterUpdateTransaction(@NonNull RNDragShadowView view) {
        super.onAfterUpdateTransaction(view);
        view.updateDragShadow();
    }

    @ReactProp(name = "dragGestureHandlerTag", defaultInt = -1)
    public void setDragGestureHandlerTag(RNDragShadowView view, int tag) {
        view.setDragGestureHandlerTag(tag);
    }
}
