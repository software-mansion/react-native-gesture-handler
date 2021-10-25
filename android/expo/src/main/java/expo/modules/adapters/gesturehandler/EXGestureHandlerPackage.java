package expo.modules.adapters.gesturehandler;

import android.app.Activity;
import android.content.Context;
import android.os.Bundle;

import com.facebook.react.ReactRootView;
import com.swmansion.gesturehandler.react.RNGestureHandlerEnabledRootView;

import java.util.Collections;
import java.util.List;

import expo.modules.core.interfaces.Package;
import expo.modules.core.interfaces.ReactActivityHandler;

public class EXGestureHandlerPackage implements Package {
    @Override
    public List<ReactActivityHandler> createReactActivityHandlers(Context activityContext) {
        final ReactActivityHandler handler = new ReactActivityHandler() {
            @Override
            public ReactRootView createReactRootView(Activity activity) {
                return new RNGestureHandlerEnabledRootView(activity);
            }
        };

        return Collections.singletonList(handler);
    }
}
