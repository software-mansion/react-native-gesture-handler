package com.swmansion.gesturehandler;

import android.view.DragEvent;

public abstract class OnTouchEventListenerImpl<T extends GestureHandler> implements OnTouchEventListener<T> {
    @Override
    public void onDragEvent(T handler, DragEvent event) {

    }
}
