package com.swmansion.gesturehandler;

import android.view.MotionEvent;

public abstract class OnDragEventListenerImpl<T extends GestureHandler> implements OnTouchEventListener<T> {
    @Override
    public void onTouchEvent(T handler, MotionEvent event) {

    }
}
