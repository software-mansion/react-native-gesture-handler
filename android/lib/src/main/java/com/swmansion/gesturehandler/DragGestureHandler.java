package com.swmansion.gesturehandler;

import android.view.MotionEvent;

public class DragGestureHandler<T> extends BaseDragGestureHandler<T> {

    /**
     * once handling begins {@link android.view.View.OnDragListener} handles gesture decision making
     */
    @Override
    protected void onHandle(MotionEvent event) {
        super.onHandle(event);
        if (getState() == STATE_UNDETERMINED) {
            begin();
            startDragging();
        }
    }

}
