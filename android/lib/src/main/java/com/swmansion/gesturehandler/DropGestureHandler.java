package com.swmansion.gesturehandler;

import android.graphics.PointF;
import android.util.Log;
import android.view.DragEvent;
import android.view.MotionEvent;
import android.view.View;
import android.view.ViewGroup;

import androidx.annotation.Nullable;

public class DropGestureHandler<T> extends BaseDragGestureHandler<T> {

    @Nullable DragGestureHandler<T> mDragHandler;

    public void setDragHandler(@Nullable DragGestureHandler<T> dragHandler) {
        mDragHandler = dragHandler;
    }

    @Override
    public boolean isWithinBounds() {
        return super.isWithinBounds();
    }

    @Override
    protected void onReset() {
        super.onReset();
        mDragHandler = null;
    }

    @Override
    protected void onHandle(DragEvent event) {
        super.onHandle(event);
        Log.d("Drop", "onHandleDrop " + event);
    }

    @Override
    protected void onHandle(MotionEvent event) {
        super.onHandle(event);
        Log.d("Drop", "onHandleDrop s " + event);
    }

    @Override
    public boolean onDrag(@Nullable View v, DragEvent event) {
        super.onDrag(v, event);
        int action = event.getAction();
        Log.d("Drag", "onDrag: inner state" + action);
        if (getState() == STATE_BEGAN) {
            activate();
        } else if (action == DragEvent.ACTION_DROP || action == DragEvent.ACTION_DRAG_ENDED) {
            end();
        }

        return true;
    }

    @Override
    public boolean shouldRecognizeSimultaneously(GestureHandler handler) {
        return super.shouldRecognizeSimultaneously(handler) || (mDragHandler != null && handler == mDragHandler);
    }
}
