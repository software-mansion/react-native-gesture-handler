package com.swmansion.gesturehandler;

import android.content.ClipData;
import android.os.Build;
import android.util.Log;
import android.view.MotionEvent;
import android.view.View;

public class DragGestureHandler<T> extends BaseDragGestureHandler<T> {

    private void startDragging() {
        Log.d("DragDrop", "startDragging: YES!");
        ClipData data = createClipData();
        View.DragShadowBuilder shadowBuilder = new View.DragShadowBuilder(getView());
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            getView().startDragAndDrop(data, shadowBuilder, null, getFlags());
        } else {
            getView().startDrag(data, shadowBuilder, null, getFlags());
        }
    }

    /**
     * once handling begins {@link android.view.View.OnDragListener} handles gesture decision making
     */
    @Override
    protected void onHandle(MotionEvent event) {
        int state = getState();

        Log.d("DragDrop", "onHandle: " + event);

        if (state == STATE_UNDETERMINED) {
            begin();
            startDragging();
        }
    }

}
