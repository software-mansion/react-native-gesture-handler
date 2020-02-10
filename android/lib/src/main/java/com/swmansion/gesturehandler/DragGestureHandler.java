package com.swmansion.gesturehandler;

import android.content.ClipData;
import android.graphics.Canvas;
import android.util.Log;
import android.view.DragEvent;
import android.view.MotionEvent;
import android.view.View;

import androidx.annotation.Nullable;

import java.util.ArrayList;

public class DragGestureHandler<T> extends DragDropGestureHandler<T> {

    private ArrayList<DropGestureHandler<T>> mDropHandlers = new ArrayList<>();

    public DragGestureHandler() {
        super();
        setShouldCancelWhenOutside(false);
    }

    private void startDragging() {
        mOrchestrator.mIsDragging = true;
        ClipData data = createClipData();
        View.DragShadowBuilder shadowBuilder = new View.DragShadowBuilder(getView());
        //View.DragShadowBuilder shadowBuilder = new SyncedDragShadowBuilder(getView());
        int flags = getFlags();
        getView().startDrag(data, shadowBuilder, null, flags);
        /*
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
            getView().startDragAndDrop(data, shadowBuilder, null, flags);
        } else {
            getView().startDrag(data, shadowBuilder, null, flags);
        }

         */
    }

    /**
     * once handling begins {@link android.view.View.OnDragListener} handles gesture decision making
     */
    @Override
    protected void onHandle(MotionEvent event) {
        if (getState() != STATE_BEGAN && getState() != STATE_ACTIVE) {
            super.onHandle(event);
            if (getState() == STATE_BEGAN) {
                startDragging();
            }
        }
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
        return super.shouldRecognizeSimultaneously(handler) || (handler instanceof DropGestureHandler && mDropHandlers.contains(handler));
    }


    private static class SyncedDragShadowBuilder extends View.DragShadowBuilder {
        private View mView;
        SyncedDragShadowBuilder(View view) {
            mView = view;
        }

        @Override
        public void onDrawShadow(Canvas canvas) {
            mView.draw(canvas);
        }
    }
}
