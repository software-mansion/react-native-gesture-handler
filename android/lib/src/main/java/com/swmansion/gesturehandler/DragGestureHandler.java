package com.swmansion.gesturehandler;

import android.util.Log;
import android.view.DragEvent;
import android.view.MotionEvent;
import android.view.View;

import androidx.annotation.Nullable;

import java.util.ArrayList;

public class DragGestureHandler<T> extends BaseDragGestureHandler<T> {

    ArrayList<DropGestureHandler<T>> mDropHandlers = new ArrayList<>();

    public DragGestureHandler() {
        super();
        setShouldCancelWhenOutside(false);
    }

    /**
     * once handling begins {@link android.view.View.OnDragListener} handles gesture decision making
     */
    @Override
    protected void onHandle(MotionEvent event) {
        super.onHandle(event);
        if (getState() == STATE_BEGAN) {
            startDragging();
        }
    }

    @Override
    public boolean onDrag(@Nullable View v, DragEvent event) {
        super.onDrag(v, event);
        int action = event.getAction();
        Log.d("Drag", "onDrag: inner state" + action);
        if (action == DragEvent.ACTION_DRAG_STARTED) {
            activate();
        } else if (action == DragEvent.ACTION_DRAG_ENDED || action == DragEvent.ACTION_DROP) {
            end();
        }

        return true;
    }

    void setDropHandlers(ArrayList<DropGestureHandler<T>> handlers) {
        mDropHandlers.clear();
        mDropHandlers.addAll(handlers);
        for (DropGestureHandler<T> handler: mDropHandlers) {
            handler.setDragHandler(this);
        }
    }

    @Override
    protected void onReset() {
        super.onReset();
        mDropHandlers.clear();
    }

    @Override
    public boolean shouldRecognizeSimultaneously(GestureHandler handler) {
        return super.shouldRecognizeSimultaneously(handler) || mDropHandlers.contains(handler);
    }
}
